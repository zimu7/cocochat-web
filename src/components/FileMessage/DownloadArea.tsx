import useCopy from "@/hooks/useCopy";
import IconDownload from "@/assets/icons/download.svg";
import IconCopy from "@/assets/icons/copy.svg";

type Props = {
  copyLink: string;
  downloadLink: string;
};

const DownloadArea = ({ copyLink, downloadLink }: Props) => {
  const { copy, copied } = useCopy();
  return (
    <div className="flex flex-col-reverse gap-1.5 items-center shrink-0">
      <button
        className="hidden md:block whitespace-nowrap"
        disabled={copied}
        onClick={copy.bind(null, copyLink, false)}
      >
        <IconCopy className="size-6 fill-muted-foreground dark:fill-muted-foreground" />
      </button>
      <a className="hidden md:block whitespace-nowrap" download={name} href={downloadLink}>
        <IconDownload className="fill-muted-foreground dark:fill-muted-foreground" />
      </a>
    </div>
  );
};

export default DownloadArea;
