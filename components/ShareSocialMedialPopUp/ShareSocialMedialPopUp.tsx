import { Button } from "../button";
import Link from "next/link";
import { BiLinkExternal } from "react-icons/bi";
import PopUp from "../PopUp/PopUp";
import { useRef } from "react";
import { PopupActions } from "reactjs-popup/dist/types";
import { text } from "stream/consumers";
import { toast } from "react-toastify";
import Image from "next/image";

interface IShareSocialMedialPopUpProps
  extends React.HTMLAttributes<HTMLDivElement> {
  shareUrl: string;
  shareText: string;
  text?: string;
}

// export default function ShareSocialMedialPopUp(
//   props: IShareSocialMedialPopUpProps
// ) {
//   const popupRef = useRef<PopupActions | null>(null);
//   return (
//     <PopUp
//       {...props}
//       info="normal"
//       trigger={
//         <div
//           onClick={(e) => {
//             popupRef.current?.open();
//             e.preventDefault();
//           }}
//           className="flex items-center gap-2 cursor-pointer hover:text-primary"
//         >
//           <span className="">{props.text}</span>
//           <BiLinkExternal className="cursor-pointer  " />
//         </div>
//       }
//       contents={
//         <div className="flex flex-wrap justify-around">
//           {/* twitter */}
//           <Link
//             target="_blank"
//             href={`https://twitter.com/intent/tweet?text=${props.shareText}%0A%0A${props.shareUrl}`}
//           >
//             <Button>Share With Twitter</Button>
//           </Link>
//           {/* telegram */}
//           <Link
//             target="_blank"
//             href={`https://telegram.me/share/url?url=${props.shareUrl}%0A&text=${props.shareText}`}
//           >
//             <Button>Share With Telegram</Button>
//           </Link>
//         </div>
//       }
//     />
//   );
// }

export default function ShareSocialMedialPopUp(
  props: IShareSocialMedialPopUpProps
) {
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        navigator.clipboard.writeText(props.shareUrl);
        toast.success(
          <div>
            <div>Copied to clipboard</div>
            <div className="m-2 text-right text-gray-800">
              {" "}
              <Link
                className="cursor-pointer flex items-center gap-2 hover:text-primary"
                target="_blank"
                href={`https://twitter.com/intent/tweet?text=${props.shareText}%0A%0A${props.shareUrl}`}
              >
                <Image
                  src="/images/twitter.png"
                  alt=""
                  width={20}
                  height={20}
                  className="bg-black rounded-full"
                />
                Share With Twitter
                <BiLinkExternal />
              </Link>
              {/* telegram */}
              <Link
                className="cursor-pointer flex items-center gap-2 hover:text-primary"
                target="_blank"
                href={`https://telegram.me/share/url?url=${props.shareUrl}%0A&text=${props.shareText}`}
              >
                <Image
                  src="/images/telegram.png"
                  alt=""
                  width={20}
                  height={20}
                />
                Share With Telegram
                <BiLinkExternal />
              </Link>
            </div>
          </div>,
          {
            autoClose: false,
          }
        );
      }}
      className="flex items-center gap-2 cursor-pointer hover:text-primary"
    >
      <span className="">{props.text}</span>
      <BiLinkExternal className="cursor-pointer" />
    </div>
  );
}
