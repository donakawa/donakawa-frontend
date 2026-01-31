import { useState, useEffect, useRef } from 'react';

// 부드러운 움직임을 위한 이징 함수
const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const useAnimatedNumber = (
  targetValue: number,
  duration: number = 500, // 애니메이션 지속 시간
) => {
  const [currentValue, setCurrentValue] = useState(0); // 초기값 0에서 시작
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);

  useEffect(() => {
    if (duration <= 0) {
      setCurrentValue(targetValue);
      return;
    }

    startValueRef.current = currentValue;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1); // 0 ~ 1 사이 진행률
      const easedProgress = easeInOutCubic(progress); // 이징 적용

      // 시작값과 목표값 사이의 현재 값 계산
      const newValue = startValueRef.current + (targetValue - startValueRef.current) * easedProgress;

      setCurrentValue(newValue);

      if (progress < 1) {
        // 아직 진행 중이면 다음 프레임 요청
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    // 컴포넌트 언마운트나 타겟 변경 시 이전 애니메이션 취소
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue, duration]);

  return currentValue;
};

export default useAnimatedNumber;
