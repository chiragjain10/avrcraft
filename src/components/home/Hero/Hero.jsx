import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Hero.module.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "WATERSTONES BOOK OF YEAR",
      subtitle: "Not long to go...",
      announcement: "ANNOUNCING 27.11.25",
      cta: "FIND OUT MORE",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    },
    {
      id: 2,
      title: "CHRISTMAS COLLECTION",
      subtitle: "Discover our festive selection",
      announcement: "LIMITED TIME OFFER",
      cta: "SHOP NOW",
      imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2128&q=80"
    },
    {
      id: 3,
      title: "BESTSELLERS",
      subtitle: "Top picks this season",
      announcement: "CURATED SELECTION",
      cta: "EXPLORE",
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  // Preload images for better performance
  useEffect(() => {
    slides.forEach(slide => {
      const img = new Image();
      img.src = slide.imageUrl;
    });
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroSlider}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          >
            <div className={styles.slideOverlay}></div>
            <div className={styles.slideContent}>
              <h1 className={styles.slideTitle}>{slide.title}</h1>
              <p className={styles.slideSubtitle}>{slide.subtitle}</p>
              <div className={styles.announcement}>{slide.announcement}</div>
              <Link to="/shop" className={styles.slideCta}>
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}

        <button className={`${styles.sliderNav} ${styles.prev}`} onClick={prevSlide} aria-label="Previous slide">
          <ChevronLeft size={24} />
        </button>
        <button className={`${styles.sliderNav} ${styles.next}`} onClick={nextSlide} aria-label="Next slide">
          <ChevronRight size={24} />
        </button>

        <div className={styles.sliderDots}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.heroNav}>
        <div className={styles.navLinks}>
          <Link to="/bestsellers">BESTSELLERS</Link>
          <Link to="/fiction">FICTION</Link>
          <Link to="/non-fiction">NON-FICTION</Link>
          <Link to="/childrens">CHILDREN'S BOOKS</Link>
          <Link to="/stationery">STATIONERY</Link>
          <Link to="/gifts">GIFTS</Link>
        </div>
        <div className={styles.deliveryInfo}>
          Free delivery on orders over ₹500, otherwise ₹50 delivery charge
        </div>
      </div>
    </section>
  );
};

export default Hero;