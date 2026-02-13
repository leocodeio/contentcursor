import { loader as featureLoader } from "../loader+/feature+/feature.loader";
import { Outlet } from "@remix-run/react";

export const loader = featureLoader;

export default function FeatureIndex() {
  return <Outlet />;
}
