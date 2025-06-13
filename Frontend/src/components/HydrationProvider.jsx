import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";

const HydrationProvider = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Chờ cho đến khi Zustand khôi phục xong
  useEffect(() => {
    const unsubHydrate = useAuthStore.persist.onHydrate(() => setIsHydrated(false));
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));

    setIsHydrated(useAuthStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return isHydrated ? children : <div>Đang tải ứng dụng...</div>;
};

export default HydrationProvider;