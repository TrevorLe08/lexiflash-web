import React from "react";
import { EntityNotFound } from "../../components/common/EntityNotFound";

export const GroupNotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <EntityNotFound type="group" />
    </div>
  );
};
