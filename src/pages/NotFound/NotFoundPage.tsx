import React from "react";
import { EntityNotFound } from "../../components/common/EntityNotFound";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <EntityNotFound type="general" />
    </div>
  );
};
