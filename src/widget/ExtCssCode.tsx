import BASE_URL from "@/app/config";
import { useEffect } from "react";

type Props = {};

const ExtCssCode = ({}: Props) => {
  useEffect(() => {
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.href = `${BASE_URL}/resource/widget-extra.css`;
    document.head.append(link);
  }, []);

  return null;
};

export default ExtCssCode;
