import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import React, { useRef } from "react";
import type { PutBlobResult } from "@vercel/blob";
import { trpcClient } from "@/lib/trpc";
import { wallet } from "@/services/wallet";

export interface UploadImageProps {
  onUpload: (url: string) => void;
  imagePath: string | null | undefined;
  blobName: string;
  variant?: "icon" | "banner";
}

export function UploadImage(props: UploadImageProps): JSX.Element {
  const fileIn = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const response = await fetch(
        `/api/upload/upload-project-icon?filename=${props.blobName}`,
        {
          method: "POST",
          body: file,
        }
      );

      const newBlob = (await response.json()) as PutBlobResult;

      props.onUpload(newBlob.url);
    }
  };

  return (
    <>
      <Tooltip content="Upload new project icon">
        {(props.variant === "banner" && (
          <Image
            src={
              !!props.imagePath
                ? props.imagePath
                : "https://upload.wikimedia.org/wikipedia/commons/5/59/Empty.png"
            }
            alt="banner"
            className="rounded-[11.712px] bg-[#ECC94E] w-[3rem] h-[3rem] self-center cursor-pointer object-cover"
            fill
            onClick={() => fileIn.current?.click()}
          ></Image>
        )) || (
          <Image
            src={
              !!props.imagePath
                ? props.imagePath
                : "https://upload.wikimedia.org/wikipedia/commons/5/59/Empty.png"
            }
            alt="icon"
            className="rounded-[11.712px] bg-[#ECC94E] w-[3rem] h-[3rem] self-center cursor-pointer"
            width={36}
            height={36}
            onClick={() => fileIn.current?.click()}
          ></Image>
        )}
      </Tooltip>
      <input
        ref={fileIn}
        type="file"
        className="hidden"
        onChange={(e) => {
          handleFileChange(e);
        }}
        accept="image/png, image/jpeg"
      />
    </>
  );
}
