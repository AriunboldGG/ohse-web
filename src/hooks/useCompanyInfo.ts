import { useEffect, useState } from "react";
import { defaultCompanyInfo, getCompanyInfo, type CompanyInfo } from "@/lib/companyInfo";

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getCompanyInfo()
      .then((info) => {
        if (isMounted) {
          setCompanyInfo(info);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { companyInfo, loading };
}
