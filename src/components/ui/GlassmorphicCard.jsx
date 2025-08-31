import { Box } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import anime from 'animejs';

const GlassmorphicCard = ({ children, variant = 'primary', ...props }) => {
  const cardRef = useRef(null);
  
  // Color variants for different card types
  const variants = {
    primary: {
      bgGradient: 'linear(to-br, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
      borderColor: 'rgba(255, 255, 255, 0.5)',
      shadowColor: 'rgba(0, 123, 255, 0.3)'
    },
    success: {
      bgGradient: 'linear(to-br, rgba(72, 187, 120, 0.4), rgba(72, 187, 120, 0.1))',
      borderColor: 'rgba(72, 187, 120, 0.5)',
      shadowColor: 'rgba(72, 187, 120, 0.3)'
    },
    info: {
      bgGradient: 'linear(to-br, rgba(49, 130, 206, 0.4), rgba(49, 130, 206, 0.1))',
      borderColor: 'rgba(49, 130, 206, 0.5)',
      shadowColor: 'rgba(49, 130, 206, 0.3)'
    },
    warning: {
      bgGradient: 'linear(to-br, rgba(221, 107, 32, 0.4), rgba(221, 107, 32, 0.1))',
      borderColor: 'rgba(221, 107, 32, 0.5)',
      shadowColor: 'rgba(221, 107, 32, 0.3)'
    },
  };
  
  const currentVariant = variants[variant] || variants.primary;
  
  // Animation effect on hover
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    
    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xPercent = x / rect.width - 0.5;
      const yPercent = y / rect.height - 0.5;
      
      anime({
        targets: card,
        rotateX: yPercent * -10,
        rotateY: xPercent * 10,
        translateZ: '0px',
        duration: 400,
        easing: 'easeOutExpo'
      });
      
      // Update gradient position for light effect
      const gradientX = (x / rect.width) * 100;
      const gradientY = (y / rect.height) * 100;
      card.style.backgroundImage = `
        ${currentVariant.bgGradient},
        radial-gradient(
          circle at ${gradientX}% ${gradientY}%, 
          rgba(255, 255, 255, 0.2), 
          transparent 40%
        )
      `;
    };
    
    const handleMouseLeave = () => {
      anime({
        targets: card,
        rotateX: 0,
        rotateY: 0,
        translateZ: 0,
        duration: 600,
        easing: 'easeOutElastic(1, .5)'
      });
      
      card.style.backgroundImage = currentVariant.bgGradient;
    };
    
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [currentVariant]);
  
  return (
    <Box
      ref={cardRef}
      position="relative"
      borderRadius="xl"
      p={6}
      backdropFilter="blur(10px)"
      bgGradient={currentVariant.bgGradient}
      borderWidth="1px"
      borderColor={currentVariant.borderColor}
      boxShadow={`0 8px 32px 0 ${currentVariant.shadowColor}`}
      transition="all 0.3s ease"
      overflow="hidden"
      transform="perspective(1000px)"
      style={{ transformStyle: 'preserve-3d' }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
        zIndex: 1
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default GlassmorphicCard;