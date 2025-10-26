import { FaWhatsapp } from "react-icons/fa";
import { usePathname } from "next/navigation";

const WhatsAppButton = () => {
  const pathname = usePathname();
  const phoneNumber = "+923354034038";

  const getMessage = () => {
    if (pathname.startsWith("/products/")) {
      let productName = decodeURIComponent(
        pathname.split("/").pop() || ""
      ).replace(/-/g, " ");
      const isCashmereProduct = productName
        .toLowerCase()
        .startsWith("100 pure");

      productName = productName.replace(
        `100 pure cashmere`,
        `100% pure cashmere`
      );
      return `Hi, I'm interested in ${
        isCashmereProduct ? "these" : "this"
      } ${productName} \`(https://sighattirebynaseem.com${pathname})\` from your website. Can you provide more details?`;
    }
    return "";
  };

  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      getMessage()
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed z-50 flex items-center justify-center p-4 text-white transition-colors duration-300 bg-green-500 rounded-full shadow-lg bottom-20 left-6 hover:bg-green-600"
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp className="w-6 h-6" />
    </button>
  );
};

export default WhatsAppButton;
