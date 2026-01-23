import useAnimatedNumber from '../hooks/useAnimatedNumber';

interface PieChartProps {
  rate: number; // 소비 비율 (0 ~ 100)
  size?: number; // 크기
  offset?: number; // 떼어낼 거리
  duration?: number; // 애니메이션 시간
}

const PieChart = ({ rate, size = 104, offset = 8, duration = 1000 }: PieChartProps) => {
  const animatedRate = useAnimatedNumber(rate, duration);

  const clampedRate = Math.min(Math.max(animatedRate, 0), 100);
  const angle = (clampedRate / 100) * 360;

  // [좌표 계산 로직]
  const midAngleDeg = angle / 2;
  const midAngleRad = midAngleDeg * (Math.PI / 180);

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
      {/* 갈색 영역 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            transparent 0deg ${angle}deg,
            var(--color-primary-brown-400) ${angle}deg 360deg
          )`,
        }}
      />

      {/* 초록색 영역 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            var(--color-primary-400) 0deg ${angle}deg,
            transparent ${angle}deg 360deg
          )`,
          transform: `translate(${x}px, ${y}px)`,
          transition: 'transform 0.1s linear',
          willChange: 'transform, background',
        }}
      />
    </div>
  );
};

export default PieChart;
