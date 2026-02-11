import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { type PanInfo, motion, useDragControls, useAnimation } from 'framer-motion';

import SeedIcon from '@/assets/seed.svg?react';
import SeedGreenIcon from '@/assets/seed_green.svg?react';
import MascotIcon from '@/assets/mascot.svg?react';
import SatisfactionIcon from '@/assets/satisfactionFace.svg?react';
import RegretIcon from '@/assets/regretFace.svg?react';
import ArrowIcon from '@/assets/arrow.svg?react';
import Trophy from '@/assets/trophy.svg?react';

import PieChart from './components/PieChart';
import { useHomePageData } from './hooks/useHomeData';
import { ReviewList } from './components/ReviewList';

const HomePage = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const sheetControls = useAnimation();

  const { budgetData, reviewItems, spendStats, isPositive, comment } = useHomePageData();

  const handleTrophyClick = () => {
    navigate(budgetData ? '/budget/result' : '/budget/setting');
  };

  const handleDragEnd = (_: any, { offset, velocity }: PanInfo) => {
    if ((velocity.y < -500 || offset.y < -90) && velocity.y < 500) {
      sheetControls.start({ y: -200 });
    } else {
      sheetControls.start({ y: 0 });
    }
  };

  return (
    <div
      className={`h-screen overflow-hidden flex flex-col items-center transition-colors duration-500 ${
        isPositive ? 'bg-secondary-100' : 'bg-[#E3EEFF]'
      }`}>
      {/* 헤더 */}
      <header className="px-[20px] py-[6px] w-full flex gap-1 bg-white border-gray-50 shadow-[0_0_3px_rgba(0,0,0,0.25)] sticky top-0 z-10 items-end">
        <SeedIcon className="w-[26px] h-[37px]" />
        <span className="text-primary-600 font-galmuri">onakawa</span>
        <div onClick={handleTrophyClick} className="ml-auto flex items-center">
          <Trophy className="cursor-pointer" />
        </div>
      </header>
      {/* 말풍선 & 캐릭터 섹션 */}
      <section className="flex flex-col items-center my-[24px] px-[20px] min-h-[200px]">
        <div className="relative text-center bg-white border-2 mb-[24px] max-w-[290px] border-primary-600 rounded-xl drop-shadow-[0_0_3px_rgba(0,0,0,0.25)]">
          <p className="text-[14px] mx-[17px] my-[14px]">{comment}</p>
          <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-primary-600 rotate-45"></div>
        </div>
        {/* 햄스터 */}
        <div className="w-[100px] h-[99px] flex items-center justify-center">
          <MascotIcon className="w-full h-full" />
        </div>
      </section>
      {/* 하단 흰색 카드 영역 */}
      <motion.section
        className="flex flex-col w-full bg-white rounded-t-[20px]  pt-1 border-1 border-gray-50 shadow-[0_0_4px_rgba(0,0,0,0.25)] relative z-20 "
        drag="y"
        dragListener={false}
        dragControls={controls}
        animate={sheetControls}
        onDragEnd={handleDragEnd}
        initial={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
        {/* 핸들바 */}
        <div
          className="w-full flex justify-center cursor-grab py-[7px] touch-none select-none "
          onPointerDown={(e) => {
            e.stopPropagation();
            controls.start(e);
          }}>
          <ArrowIcon className="w-[10px] h-[16px] -rotate-90 text-gray-100"></ArrowIcon>
        </div>
        <div className="flex-1 overflow-y-auto px-[20px] pb-[600px]">
          {/* 요약 카드 */}
          <div className="flex justify-between items-center mt-[10px] mb-[28px] border-1 border-gray-50 shadow-[0_0_4px_rgba(0,0,0,0.25)] rounded-[20px] p-[20px] ">
            <div className="space-y-6">
              <div className="flex flex-col gap-[10px]">
                <div className="flex items-center gap-[14px] text-[14px]">
                  <SeedGreenIcon className="w-[27px] h-[35px]" /> 소비
                </div>

                <div className="text-[24px] leading-none font-bold ">{spendStats.totalSpend.toLocaleString()}원</div>
              </div>

              <div className="flex flex-col gap-[10px]">
                <div className="flex items-center gap-[14px] text-[14px]">
                  <SeedIcon className=" w-[27px] h-[35px] " /> 남은 예산
                </div>

                <div className="text-[24px] leading-none font-bold">
                  {spendStats.remainingBudget.toLocaleString()}원
                </div>
              </div>
            </div>
            {/* 파이 차트 */}
            <div className=" mr-[10px]">
              <PieChart rate={spendStats.spendRate} size={144} />
            </div>
          </div>
          {/* 만족/후회 버튼 */}
          <div className="grid grid-cols-2 gap-[13px] mb-[28px]">
            <Link
              to="/consumption/satisfaction"
              className="flex items-center justify-between px-[10px] py-[17px] bg-white rounded-[20px] border-1 border-gray-50  shadow-[0_0_4px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-[8px] text-[16px] font-medium ">
                <SatisfactionIcon className="w-[39px] h-[39px]" /> 만족 소비
              </div>
              <ArrowIcon className="w-[24px] h-[24px] px-[8px] py-[5px] text-gray-600" />
            </Link>
            <Link
              to="/consumption/regret"
              className="flex items-center justify-between px-[10px] py-[17px] bg-white rounded-[20px] border-1 border-gray-50 shadow-[0_0_4px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-[8px] text-[16px] font-medium">
                <RegretIcon className="w-[39px] h-[39px] " /> 후회 소비
              </div>
              <ArrowIcon className="w-4 h-4 text-gray-600" />
            </Link>
          </div>
          {/* 후기 리스트 */}
          <Link to="/report/review">
            <ReviewList items={reviewItems} scrollRef={scrollRef} />
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
