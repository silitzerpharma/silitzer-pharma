import React, { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import './OfferSlider.scss';
import { useNavigate } from 'react-router-dom';

const OfferSlider = ({ offersList = [] }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiperReady, setSwiperReady] = useState(false);

  const navigate = useNavigate();

  const handleOfferClick = (offerId) => {
    navigate(`/distributor/offerproducts/${offerId}`);
  };

  // Determine if loop should be enabled
  const shouldLoop = offersList.length >= 3;

  useEffect(() => {
    setSwiperReady(true); // Wait until refs are assigned
  }, []);

  return (
    <div className="offer-slider-container relative px-4">
      <h2 className="slider-heading">Latest Offers From Silitzer Pharma</h2>

      <div className="slider-nav-button left-button" ref={prevRef}>
        &#8249;
      </div>
      <div className="slider-nav-button right-button" ref={nextRef}>
        &#8250;
      </div>

      {swiperReady && (
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={20}
          loop={shouldLoop}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          speed={1000}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
            1280: {
              slidesPerView: 3,
            },
            1536: {
              slidesPerView: 3,
            },
          }}
        >
          {offersList.map((offer, index) => (
            <SwiperSlide key={index}>
              <div
                className="offer-card"
                onClick={() => handleOfferClick(offer._id)}
              >
                <img
                  src={offer.image || '/placeholder.jpg'}
                  alt={offer.company}
                  className="offer-image"
                />
                <div className="offer-info">
                  <p className="offer-description">{offer.description}</p>
                  <p className="offer-validity">
                    Valid till:{" "}
                    {new Date(offer.validTill).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default OfferSlider;
