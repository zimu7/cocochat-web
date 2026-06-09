import Popover from "../Popover";
import { useAppSelector } from "@/app/store";
import Profile from "../Profile";
import { shallowEqual } from "react-redux";

interface Props {
  uid: number;
  popover?: boolean;
  cid?: number;
  textOnly?: boolean;
  className?: string;
}

const Mention = ({ uid, popover = true, cid, textOnly = false, className = "text-primary-400" }: Props) => {
  const usersData = useAppSelector((store) => store.users.byId, shallowEqual);
  const user = usersData[uid];
  if (!user) return null;
  if (textOnly) return <>{`@${user.name}`}</>;
  if (!popover) return <span className={`px-0.5 ${className}`}>{`@${user.name}`}</span>;
  return (
    <Popover
      placement="top"
      content={<Profile uid={uid} type="card" cid={cid} />}
    >
      <span className={`px-0.5 ${className} cursor-pointer`}>{`@${user.name}`}</span>
    </Popover>
  );
};

export default Mention;
