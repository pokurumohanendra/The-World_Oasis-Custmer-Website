import Navigation from '@/app/_components/Navigation';
import Logo from '@/app/_components/Logo';

function Header() {
  return (
    <header className='border-b border-primary-800 bg-white/90 backdrop-blur px-4 py-4 sm:px-6 lg:px-8 lg:py-5 shadow-sm'>
      <div className='flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center max-w-7xl mx-auto'>
        <Logo />
        <Navigation />
      </div>
    </header>
  );
}

export default Header;
