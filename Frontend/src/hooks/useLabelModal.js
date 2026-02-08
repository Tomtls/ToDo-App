import { useState } from "react";

export function useLabelModal() {
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [labelModalInput, setLabelModalInput] = useState("");

  const open = () => setIsLabelModalOpen(true);

  const close = () => {
    setIsLabelModalOpen(false);
    setLabelModalInput("");
  };

  return {
    isLabelModalOpen,
    labelModalInput,
    setLabelModalInput,
    open,
    close,
  };
}
