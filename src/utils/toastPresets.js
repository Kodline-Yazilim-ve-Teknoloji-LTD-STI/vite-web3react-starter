import { toast } from "react-hot-toast";

const defaultOptions = {
  position: "top-right",
};

export const error = (message) =>
  toast.error(message, {
    ...defaultOptions,
  });

export const emoji = (message, emoji) =>
  toast(message, { ...defaultOptions, icon: emoji });

export const success = (message) =>
  toast.success(message, {
    ...defaultOptions,
  });

export default { error, emoji, success };
