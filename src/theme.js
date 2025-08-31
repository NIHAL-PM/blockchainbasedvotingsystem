import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: '"Poppins", sans-serif',
    body: '"Inter", sans-serif',
  },
  colors: {
    brand: {
      50: '#e0f2fe',
      100: '#bae6fd',
      200: '#7dd3fc',
      300: '#38bdf8',
      400: '#0ea5e9',
      500: '#0284c7',
      600: '#0369a1',
      700: '#075985',
      800: '#0c4a6e',
      900: '#082f49',
    },
    accent: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'lg',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
      },
      variants: {
        solid: (props) => ({
          bg: `${props.colorScheme}.500`,
          color: 'white',
          _hover: {
            bg: `${props.colorScheme}.600`,
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
        }),
        glass: {
          bg: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.25)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '700',
        letterSpacing: '-0.02em',
      },
    },
    Input: {
      variants: {
        glass: {
          field: {
            bg: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderWidth: '1px',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            _placeholder: {
              color: 'rgba(255, 255, 255, 0.5)',
            },
            _hover: {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            _focus: {
              borderColor: 'brand.300',
              boxShadow: '0 0 0 1px rgba(56, 189, 248, 0.6)',
            },
          },
        },
      },
    },
    Select: {
      variants: {
        glass: {
          field: {
            bg: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderWidth: '1px',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            _hover: {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            _focus: {
              borderColor: 'brand.300',
              boxShadow: '0 0 0 1px rgba(56, 189, 248, 0.6)',
            },
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
      },
    },
  },
});

export default theme;