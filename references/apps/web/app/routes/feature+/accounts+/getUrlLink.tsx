import { action as getLinkUrlAction } from "~/routes/action+/feature+/creator+/accounts+/get-link-url.action";
export const action = getLinkUrlAction;

export default function GetUrlLink() {
  return <div>GetUrlLink</div>;
}

export const loader = () => {
  return null;
};
