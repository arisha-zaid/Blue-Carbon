import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Custom text splitting function since GSAP SplitText is a premium plugin
const splitTextIntoElements = (element, splitType) => {
  const text = element.textContent;
  let splitElements = [];
  
  if (splitType === 'chars' || splitType === 'words, chars') {
    // Split into characters
    const chars = text.split('');
    element.innerHTML = '';
    chars.forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.style.display = 'inline-block';
      span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space
      element.appendChild(span);
      splitElements.push(span);
    });
  } else if (splitType === 'words') {
    // Split into words
    const words = text.split(' ');
    element.innerHTML = '';
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'split-word';
      span.style.display = 'inline-block';
      span.textContent = word;
      element.appendChild(span);
      splitElements.push(span);
      
      // Add space after word (except last word)
      if (index < words.length - 1) {
        const space = document.createElement('span');
        space.textContent = ' ';
        space.style.display = 'inline-block';
        element.appendChild(space);
      }
    });
  } else {
    // Default to characters if splitType is not recognized
    const chars = text.split('');
    element.innerHTML = '';
    chars.forEach((char) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.style.display = 'inline-block';
      span.textContent = char === ' ' ? '\u00A0' : char;
      element.appendChild(span);
      splitElements.push(span);
    });
  }
  
  return splitElements;
};

const SplitText = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'p',
  textAlign = 'center',
  onLetterAnimationComplete
}) => {
  const ref = useRef(null);
  const animationCompletedRef = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      const el = ref.current;

      // Clean up previous animation
      if (el._splitElements) {
        el._splitElements = null;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      // Split text into elements
      const splitElements = splitTextIntoElements(el, splitType);
      el._splitElements = splitElements;

      // Animate the split elements
      gsap.fromTo(
        splitElements,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
            fastScrollEnd: true,
            anticipatePin: 0.4
          },
          onComplete: () => {
            animationCompletedRef.current = true;
            onLetterAnimationComplete?.();
          },
          willChange: 'transform, opacity',
          force3D: true
        }
      );

      return () => {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === el) st.kill();
        });
        if (el._splitElements) {
          el._splitElements = null;
        }
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        onLetterAnimationComplete
      ],
      scope: ref
    }
  );

  const renderTag = () => {
    const style = {
      textAlign,
      wordWrap: 'break-word',
      willChange: 'transform, opacity'
    };
    const classes = `split-parent overflow-hidden inline-block whitespace-normal ${className}`;
    switch (tag) {
      case 'h1':
        return (
          <h1 ref={ref} style={style} className={classes}>
            {text}
          </h1>
        );
      case 'h2':
        return (
          <h2 ref={ref} style={style} className={classes}>
            {text}
          </h2>
        );
      case 'h3':
        return (
          <h3 ref={ref} style={style} className={classes}>
            {text}
          </h3>
        );
      case 'h4':
        return (
          <h4 ref={ref} style={style} className={classes}>
            {text}
          </h4>
        );
      case 'h5':
        return (
          <h5 ref={ref} style={style} className={classes}>
            {text}
          </h5>
        );
      case 'h6':
        return (
          <h6 ref={ref} style={style} className={classes}>
            {text}
          </h6>
        );
      default:
        return (
          <p ref={ref} style={style} className={classes}>
            {text}
          </p>
        );
    }
  };

  return renderTag();
};

export default SplitText;