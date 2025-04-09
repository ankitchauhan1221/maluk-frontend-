'use client';

import { AuthProvider } from '@/lib/authContext';
import GlobalProvider from './GlobalProvider';
import ModalCart from '@/components/Modal/ModalCart';
import ModalWishlist from '@/components/Modal/ModalWishlist';
import ModalSearch from '@/components/Modal/ModalSearch';
import CountdownTimeType from '@/type/CountdownType';
import { countdownTime } from '@/store/countdownTime';

const serverTimeLeft: CountdownTimeType = countdownTime();

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <GlobalProvider>
      <AuthProvider>
        {children}
        <ModalCart serverTimeLeft={serverTimeLeft} />
        <ModalWishlist />
        <ModalSearch />
      </AuthProvider>
    </GlobalProvider>
  );
}
