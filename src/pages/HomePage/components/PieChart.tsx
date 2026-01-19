// src/components/PieChart.tsx
import React from 'react';
import useAnimatedNumber from '../hooks/useAnimatedNumber'; // 훅 경로는 프로젝트에 맞게 확인해주세요

interface PieChartProps {
  rate: number; // 소비 비율 (0 ~ 100)
  size?: number; // 크기
  offset?: number; // 떼어낼 거리
  duration?: number; // 애니메이션 시간 (ms 단위) - 추가됨
}

const PieChart = ({
  rate,
  size = 104,
  offset = 8,
  duration = 1000, // 기본값을 1.5초(1500)로 변경했습니다 (기존 500)
}: PieChartProps) => {
  // duration 값을 훅에 전달하여 속도를 제어합니다.
  const animatedRate = useAnimatedNumber(rate, duration);

  const clampedRate = Math.min(Math.max(animatedRate, 0), 100);
  const angle = (clampedRate / 100) * 360;

  // [좌표 계산 로직]
  const midAngleDeg = angle / 2;
  const midAngleRad = midAngleDeg * (Math.PI / 180);

  // 1% 미만일 때는 튀어나오지 않게 처리 (애니메이션 초반 덜컥거림 방지)
  const currentOffset = animatedRate < 1 ? 0 : offset;

  const x = Math.sin(midAngleRad) * currentOffset;
  const y = -Math.cos(midAngleRad) * currentOffset;

  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
      }}>
      {/* 1. 갈색 영역 (베이스) */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            transparent 0deg ${angle}deg,
            var(--color-primary-brown-400) ${angle}deg 360deg
          )`,
        }}
      />

      {/* 2. 초록색 영역 (떼어낸 조각) */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            var(--color-primary-400) 0deg ${angle}deg,
            transparent ${angle}deg 360deg
          )`,
          transform: `translate(${x}px, ${y}px)`,
          // transform 이동도 조금 더 부드럽게 따라오도록 시간 조정
          transition: 'transform 0.1s linear',
          willChange: 'transform, background',
        }}
      />
    </div>
  );
};

export default PieChart;
