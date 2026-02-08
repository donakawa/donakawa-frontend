// src/apis/HomePage/aichat.ts
import { axiosInstance } from '@/apis/axios';

export type ChatItemType = 'AUTO' | 'MANUAL';

export type CreateChatRequest = {
  type: ChatItemType;
  wishItemId: number;
};

export type ChatRoom = {
  id: number;
  currentStep: number;
  createdAt: string;
};

export type ChatQuestionOption = {
  id: number;
  label: string;
};

export type ChatQuestionInProgress = {
  step: number;
  question: string;
  options: ChatQuestionOption[];
};

export type ChatQuestionDone = {
  message: string;
};

export type ChatQuestionResponse = ChatQuestionInProgress | ChatQuestionDone;

// ✅ 노션 캡처: { decision: "구매 보류", message: "..." }
export type ChatResult = {
  decision: string; // "구매 보류" | "구매 추천" 등
  message: string;
};

// ✅ 채팅방 목록 아이템 (GET /chats)
export type ChatRoomListItem = {
  id: number;
  title: string;
  createdAt: string;
};

// ✅ 채팅방 상세 (GET /chats/{id}) - 명세서 기반
export type ChatRoomDetail = {
  id: number;
  wishItem: {
    id: number;
    name: string;
    price: number;
  };
  answers: Array<{
    step: number;
    selectedOption: string;
  }>;
  result: string; // "구매 보류" | "구매 추천"
  currentStep: number; // 4면 완료(질문 3개)
};

type ApiWrappedSuccess<T> = { resultType: 'SUCCESS'; error: null; data: T };
type ApiWrappedFail = {
  resultType: 'FAIL' | 'FAILED';
  error: { errorCode?: string | null; reason?: string; message?: string; data?: unknown | null };
  data: null;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isWrappedSuccess<T>(x: unknown): x is ApiWrappedSuccess<T> {
  return isObject(x) && x.resultType === 'SUCCESS' && x.error === null && 'data' in x;
}

function isWrappedFail(x: unknown): x is ApiWrappedFail {
  if (!isObject(x)) return false;
  return x.resultType === 'FAIL' || x.resultType === 'FAILED';
}

function failMessage(x: unknown, fallback: string): string {
  if (!isObject(x)) return fallback;
  if (isWrappedFail(x)) {
    return x.error?.reason ?? x.error?.message ?? fallback;
  }
  const msg = x.message;
  return typeof msg === 'string' && msg.trim() ? msg : fallback;
}

// ✅ POST /chats
export async function createChat(payload: CreateChatRequest): Promise<ChatRoom> {
  const res = await axiosInstance.post<ChatRoom | ApiWrappedSuccess<ChatRoom> | ApiWrappedFail>('/chats', payload, {
    withCredentials: true,
  });

  const body = res.data;

  if (isWrappedSuccess<ChatRoom>(body)) return body.data;
  if (isWrappedFail(body)) throw new Error(failMessage(body, '채팅방 생성에 실패했어요.'));

  if (isObject(body)) {
    const id = body.id;
    const currentStep = body.currentStep;
    const createdAt = body.createdAt;
    if (typeof id === 'number' && typeof currentStep === 'number' && typeof createdAt === 'string') {
      return { id, currentStep, createdAt };
    }
  }

  throw new Error('채팅방 생성 응답을 해석할 수 없어요.');
}

// ✅ GET /chats/{id}/question
export async function getChatQuestion(chatId: number): Promise<ChatQuestionResponse> {
  const res = await axiosInstance.get<ChatQuestionResponse | ApiWrappedSuccess<ChatQuestionResponse> | ApiWrappedFail>(
    `/chats/${chatId}/question`,
    { withCredentials: true },
  );

  const body = res.data;

  if (isWrappedSuccess<ChatQuestionResponse>(body)) return body.data;
  if (isWrappedFail(body)) throw new Error(failMessage(body, '질문을 불러오지 못했어요.'));
  if (isObject(body)) return body as ChatQuestionResponse;

  throw new Error('질문을 불러오지 못했어요.');
}

// ✅ POST /chats/{id}/select
export async function postChatSelect(
  chatId: number,
  payload: { step: number; selectedOptionId: number },
): Promise<void> {
  const res = await axiosInstance.post<ApiWrappedSuccess<unknown> | ApiWrappedFail | unknown>(
    `/chats/${chatId}/select`,
    payload,
    {
      withCredentials: true,
    },
  );

  const body = res.data;
  if (isWrappedFail(body)) throw new Error(failMessage(body, '선택 저장에 실패했어요.'));
}

// ✅ GET /chats/{id}/result
export async function getChatResult(chatId: number): Promise<ChatResult> {
  const res = await axiosInstance.get<ChatResult | ApiWrappedSuccess<ChatResult> | ApiWrappedFail>(
    `/chats/${chatId}/result`,
    {
      withCredentials: true,
    },
  );

  const body = res.data;

  if (isWrappedSuccess<ChatResult>(body)) return body.data;
  if (isWrappedFail(body)) throw new Error(failMessage(body, '최종 판단을 불러오지 못했어요.'));
  if (isObject(body)) {
    const decision = body.decision;
    const message = body.message;
    if (typeof decision === 'string' && typeof message === 'string') return { decision, message };
  }

  throw new Error('최종 판단 응답을 해석할 수 없어요.');
}

/* ------------------------------------------------------ */
/* ✅ 연동 추가: 목록 / 상세 / 삭제 */
/* ------------------------------------------------------ */

// ✅ GET /chats
export async function getChatRooms(): Promise<ChatRoomListItem[]> {
  const res = await axiosInstance.get<unknown>('/chats', { withCredentials: true });
  const body = res.data;

  const raw = isWrappedSuccess<unknown>(body) ? body.data : body;
  if (!raw) return [];

  const list = Array.isArray(raw) ? raw : isObject(raw) && Array.isArray(raw.chats) ? raw.chats : null;
  if (!list) return [];

  return list
    .map((x): ChatRoomListItem | null => {
      if (!isObject(x)) return null;
      const id = x.id;
      const title = x.title ?? x.name ?? x.wishItemName;
      const createdAt = x.createdAt ?? x.created_at;
      if (typeof id !== 'number') return null;
      return {
        id,
        title: typeof title === 'string' && title.trim() ? title : `채팅 ${id}`,
        createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
      };
    })
    .filter((v): v is ChatRoomListItem => v !== null);
}

// ✅ GET /chats/{id}
export async function getChatRoomDetail(chatId: number): Promise<ChatRoomDetail> {
  const res = await axiosInstance.get<ChatRoomDetail | ApiWrappedSuccess<ChatRoomDetail> | ApiWrappedFail>(
    `/chats/${chatId}`,
    {
      withCredentials: true,
    },
  );

  const body = res.data;

  if (isWrappedSuccess<ChatRoomDetail>(body)) return body.data;
  if (isWrappedFail(body)) throw new Error(failMessage(body, '채팅방 상세를 불러오지 못했어요.'));

  if (isObject(body)) {
    // 최소 필드 체크
    const id = body.id;
    const wishItem = body.wishItem;
    if (typeof id === 'number' && isObject(wishItem)) {
      return body as ChatRoomDetail;
    }
  }

  throw new Error('채팅방 상세 응답을 해석할 수 없어요.');
}

// ✅ DELETE /chats/{id}
export async function deleteChatRoom(chatId: number): Promise<void> {
  const res = await axiosInstance.delete<unknown>(`/chats/${chatId}`, { withCredentials: true });
  const body = res.data;

  if (isWrappedFail(body)) throw new Error(failMessage(body, '채팅방 삭제에 실패했어요.'));
}
