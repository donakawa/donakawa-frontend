import { useEffect, useRef, useState } from 'react';
import RegistrationInput from './components/RegistrationInput';
import LinkLoadingScreen from './LinkLoadingScreen';
import type { WishItemData } from '../../types/WishlistPage/WishItemData';
import { startCrawlTask, getCrawlResult } from '@/apis/WishlistPage/wishlistItems';
import DefaultPhoto from '@/assets/default_photo.svg';

interface Props {
  onBack: () => void;
  onComplete: (data: WishItemData & { cacheId?: string }) => void;
}

// 타임아웃 발생 시 최대 재시도 횟수
const MAX_RETRIES = 3;

export default function LinkRegistrationPage({ onBack, onComplete }: Props) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const isDoneRef = useRef(false);
  // 컴포넌트 언마운트 시 SSE 연결을 닫기
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  //SSE(Server-Sent Events)를 통해 크롤링 진행 상황을 수신
  const subscribeToEvents = (jobId: string, originalUrl: string) => {
    const sseUrl = `${import.meta.env.VITE_API_BASE_URL}/wishlist/crawl-tasks/${jobId}/events`;
    
    const eventSource = new EventSource(sseUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    // 서버로부터 'done' 이벤트 수신 시 처리
    eventSource.addEventListener('done', async (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const { result, dataId } = payload.result;

        if (result === 'DONE' && dataId) {
          isDoneRef.current = true;
          const resultRes = await getCrawlResult(dataId);
          
          eventSource.close();
          setIsLoading(false);
          retryCountRef.current = 0; // 성공 시 재시도 횟수 초기화

          if (resultRes.resultType === "SUCCESS") {
            const d = resultRes.data;
            onComplete({
              name: d.productName,
              price: d.price.toLocaleString(),
              brand: d.brandName,
              store: d.platformName,
              image: d.imageUrl || DefaultPhoto,
              url: originalUrl,
              cacheId: dataId
            });
          }
        } else if (result === 'FAILED') {
          throw new Error("CRAWL_FAILED");
        }
      } catch (err) {
        if (!isDoneRef.current) { // 성공하지 않았을 때만 에러 처리
          eventSource.close();
          setIsLoading(false);
          alert("상품 정보를 분석하는 데 실패했습니다.");
        }
      }
    });

    eventSource.onerror = (_e: any) => {
      if (isDoneRef.current) return;
      eventSource.close();
      
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        console.log(`연결 지연 발생 - ${retryCountRef.current}번째 재시도 중...`);
        
        setTimeout(() => subscribeToEvents(jobId, originalUrl), 2000);
      } else {
        setIsLoading(false);
        retryCountRef.current = 0;
        alert("상품 정보를 가져오는 시간이 너무 오래 걸립니다. 잠시 후 다시 시도해주세요.");
      }
    };
  };

  const handleRegister = async () => {
    if (!url || isLoading) return;
    setIsLoading(true);
    retryCountRef.current = 0;
    isDoneRef.current = false;

    try {
      const startRes = await startCrawlTask(url);
      
      if (startRes.resultType === "SUCCESS") {
        const jobId = startRes.data.jobId;
        subscribeToEvents(jobId, url);
      } else {
        throw new Error("TASK_START_FAILED");
      }
    } catch (error: any) {
      setIsLoading(false);

      if (error.response?.status === 409) {
        const errorMessage = error.response.data?.error?.message || "이미 추가된 상품입니다.";
        alert(errorMessage);
      }
      else {
        alert("크롤링 요청 중 오류가 발생했습니다.");
      }
      
      console.error("Crawl request error:", error);
    }
  };

  // 정보 수집 중일 때 로딩 화면
  if (isLoading) return <LinkLoadingScreen />;

  return (
    <div className="absolute inset-0 z-[100] bg-white flex flex-col">
      <header className="flex items-center justify-between px-5 h-[56px] shrink-0">
        <button onClick={onBack} className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-[18px] font-bold text-black">위시템 등록</h1>
        <div className="w-[44px]" />
      </header>

      <main className="px-5 pt-12 flex-1 flex flex-col items-center">
        <RegistrationInput value={url} onChange={setUrl} placeholder="URL" />
        <p className="w-full text-right text-[12px] text-[#CECECE] mt-2 px-1">
          무신사, 29CM 상품 페이지 URL만 지원합니다.
        </p>

        <div className="mt-30 w-full flex justify-center">
          <button
            onClick={handleRegister}
            disabled={!url}
            className={`w-[335px] h-[52px] rounded-[12px] text-[16px] font-bold transition-colors ${
              url 
                ? 'bg-[color:var(--color-primary-500)] text-white' 
                : 'bg-[#CECECE] text-white'
            }`}
          >
            등록하기
          </button>
        </div>
      </main>
    </div>
  );
}