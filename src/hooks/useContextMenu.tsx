import { useState } from "react";

export default function useContextMenu() {
  const [visible, setVisible] = useState(false);

  const handleContextMenuEvent = (evt: MouseEvent) => {
    evt.preventDefault();
    setVisible(true);
  };

  const hideContextMenu = () => {
    setVisible(false);
  };

  return {
    visible,
    hideContextMenu,
    handleContextMenuEvent
  };
}
