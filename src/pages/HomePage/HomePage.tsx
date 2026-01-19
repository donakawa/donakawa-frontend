import React, { useState, useRef } from 'react';
import SeedIcon from '@/assets/seed.svg?react';
import SeedGreenIcon from '@/assets/seed_green.svg?react';
import MascotIcon from '@/assets/mascot.svg?react';
import SatisfactionIcon from '@/assets/satisfactionface.svg?react';
import RegretIcon from '@/assets/regretface.svg?react';
import ArrowIcon from '@/assets/arrow.svg?react';
import PieChart from './components/PieChart';

import { type PanInfo, motion, useDragControls, useAnimation } from 'framer-motion';

const mockReviews = [
  { id: 1, dDay: '38 Day+', price: '238,400', name: '캐시미어 로제...', img: 'bg-red-100' },
  { id: 2, dDay: '38 Day+', price: '238,400', name: '캐시미어 로제...', img: 'bg-red-100' },
  { id: 3, dDay: '38 Day+', price: '238,400', name: '캐시미어 로제...', img: 'bg-red-100' },
  { id: 4, dDay: '38 Day+', price: '238,400', name: '캐시미어 로제...', img: 'bg-red-100' },
];

const HomePage = () => {
  // 긍정/부정 상태
  const [isPositive, setIsPositive] = useState(true);
  // 드래그 컨트롤
  const controls = useDragControls();
  // 가로 스크롤 참조
  const scrollRef = useRef(null);
  // 시트 애니메이션 컨트롤
  const sheetControls = useAnimation();

  // 드래그 종료 핸들러
  const handleDragEnd = (_: Event, { offset, velocity }: PanInfo) => {
    if ((velocity.y < -500 || offset.y < -120) && velocity.y < 500) {
      sheetControls.start({ y: -240 });
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
      <header className="pl-[20px] py-[2px] w-full flex gap-1 bg-white border-gray-50 shadow-[0_0_3px_rgba(0,0,0,0.25)] sticky top-0 z-10 items-end">
        <SeedIcon className="w-[26px] h-[37px]" />
        <span className="text-primary-600 leading-none font-galmuri">onakawa</span>
      </header>
      {/* 말풍선 & 캐릭터 섹션 */}
      <section className="flex flex-col items-center my-[24px] px-[20px] min-h-[200px]">
        {/* 말풍선 */}
        <div className="relative text-center bg-white border-2 mb-[24px] max-w-[278px] border-primary-600 rounded-xl drop-shadow-[0_0_3px_rgba(0,0,0,0.25)]">
          <p className="text-[14px] mx-[17px] my-[14px]">
            {isPositive
              ? '이번 달 소비를 참은 금액은 124,700원으로, 후쿠오카 2박 숙소 값을 아꼈어요!'
              : '돈을 못 아꼈어요...ver...'}
          </p>
          <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-primary-600 rotate-45"></div>
        </div>

        {/* 햄스터 */}
        <div className="w-[100px] h-[99px] flex items-center justify-center">
          <MascotIcon className="w-full h-full" />
        </div>
      </section>
      {/* 

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
                <div className="text-[24px] leading-none font-bold ">104,500원</div>
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="flex items-center gap-[14px] text-[14px]">
                  <SeedIcon className=" w-[27px] h-[35px] " /> 남은 예산
                </div>
                <div className="text-[24px] leading-none font-bold">195,500원</div>
              </div>
            </div>
            {/* 파이 차트 */}
            <div className=" mr-[10px]">
              <PieChart rate={35} size={144} />
            </div>
          </div>
          {/* 만족/후회 버튼 */}
          <div className="grid grid-cols-2 gap-[13px] mb-[28px]">
            <button className="flex items-center justify-between px-[10px] py-[17px] bg-white rounded-[20px] border-1 border-gray-50  shadow-[0_0_4px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-[8px] text-[16px] font-medium ">
                <SatisfactionIcon className="w-[39px] h-[39px]" /> 만족 소비
              </div>
              <ArrowIcon className="w-[24px] h-[24px] px-[8px] py-[5px] text-gray-600" />
            </button>
            <button className="flex items-center justify-between px-[10px] py-[17px] bg-white rounded-[20px] border-1 border-gray-50 shadow-[0_0_4px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-[8px] text-[16px] font-medium">
                <RegretIcon className="w-[39px] h-[39px] " /> 후회 소비
              </div>
              <ArrowIcon className="w-[24px] h-[24px] px-[8px] py-[5px] text-gray-600" />
            </button>
          </div>
          {/* 소비 후기 리스트 섹션 */}
          <div className="mb-[100px]">
            {/* 타이틀 */}
            <div className="flex justify-between items-center mb-[14px] ">
              <div className="text-[12px]">소비 후기 작성하러 가볼까요?</div>
              <ArrowIcon className="w-[24px] h-[24px] px-[8px] py-[5px]" />
            </div>

            {/* 가로 스크롤 카드 리스트 */}
            <div ref={scrollRef} className="overflow-hidden -mx-[20px]">
              <motion.div
                className="flex gap-4 w-max px-[20px]"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                drag="x"
                dragConstraints={scrollRef}>
                {mockReviews.map((item) => (
                  <div key={item.id} className="flex flex-col min-w-[94px] gap-[6px] cursor-pointer">
                    {/* D-Day */}
                    <span className="text-gray-600 text-[12px] mb-[2px] leading-none font-medium">{item.dDay}</span>

                    <div className={`w-[94px] h-[94px] rounded-[5px] ${item.img} overflow-hidden`}>
                      {/* <img src={item.imgUrl} alt="" className="w-full h-full object-cover" /> */}
                    </div>

                    {/* 가격 및 이름 */}
                    <div className="flex flex-col gap-[6px] px-[2px]">
                      <span className="text-[12px] leading-none">{item.price}</span>
                      <span className="text-[12px] leading-none truncate w-full">{item.name}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
