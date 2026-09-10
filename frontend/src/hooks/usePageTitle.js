import { useEffect } from "react";

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = `SmartDesk | ${title}`;
  }, [title]);
};

export default usePageTitle;