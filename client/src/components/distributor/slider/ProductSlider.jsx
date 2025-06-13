import React, { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import SliderCard from './SliderCard';
import './ProductSlider.scss';

const ProductSlider = ({ productsList = [], title = '' }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // Local state to trigger re-render after refs are set
  const [swiperReady, setSwiperReady] = useState(false);

  useEffect(() => {
    // When refs exist, trigger re-render so swiper picks them up
    if (prevRef.current && nextRef.current) {
      setSwiperReady(true);
    }
  }, []);

  return (
    <div className="slider-container relative">
      <div className="slider-title">{title}</div>

      <div className="slider-nav-button left-button" ref={prevRef}>
        &#8249;
      </div>
      <div className="slider-nav-button right-button" ref={nextRef}>
        &#8250;
      </div>

      {Array.isArray(productsList) && productsList.length > 0 ? (
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={20}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          speed={800}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            if (swiper.params.navigation) {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }
          }}
          breakpoints={{
            0: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
          }}
          key={swiperReady ? 'ready' : 'loading'} // force re-init when ready
        >
          {productsList.map((product, idx) => (
            <SwiperSlide key={product._id || idx}>
              <SliderCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="text-center text-gray-500 py-6">No products to display.</div>
      )}
    </div>
  );
};

export default ProductSlider;
