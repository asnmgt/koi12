import { useMemo } from "react";
import useSWR from "swr";
import type { LabelsResponse } from "@/app/api/labels/route";
import type { EmailLabel } from "@/providers/EmailProvider";

export type UserLabel = {
  id: string;
  name: string;
  type: "user";
  labelListVisibility?: string;
  messageListVisibility?: string;
  color?: {
    textColor?: string | null;
    backgroundColor?: string | null;
  };
};

export type OutlookLabel = {
  id: string;
  name: string;
  type: "user";
  color?: string;
};

export type GenericLabel = UserLabel | OutlookLabel;

type SortableLabel = {
  id: string | null | undefined;
  name: string | null | undefined;
  type: string | null;
  color?: {
    textColor?: string | null;
    backgroundColor?: string | null;
  };
};

function isHidden(label: EmailLabel): boolean {
  return label.labelListVisibility === "labelHide";
}

export function useAllLabels() {
  const { data, isLoading, error, mutate } =
    useSWR<LabelsResponse>("/api/labels");

  const userLabels = useMemo(() => {
    if (!data?.labels) return [];

    return data.labels
      .filter((label) => label.type === "user")
      .sort(sortLabels);
  }, [data?.labels]);

  return {
    userLabels,
    data,
    isLoading,
    error,
    mutate,
  };
}

export function useLabels() {
  const { data, isLoading, error, mutate } =
    useSWR<LabelsResponse>("/api/labels");

  const userLabels: EmailLabel[] = useMemo(() => {
    if (!data?.labels) return [];

    return data.labels
      .filter((label) => label.type === "user")
      .map((label) => ({
        id: label.id || "",
        name: label.name || "",
        type: label.type || null,
        color: label.color,
        labelListVisibility: label.labelListVisibility,
        messageListVisibility: label.messageListVisibility,
      }))
      .sort(sortLabels);
  }, [data?.labels]);

  return {
    userLabels,
    isLoading,
    error,
    mutate,
  };
}

export function useSplitLabels() {
  const { userLabels, isLoading, error, mutate } = useLabels();

  const { visibleLabels, hiddenLabels } = useMemo(() => {
    // Split labels into visible and hidden categories
    const visible: EmailLabel[] = [];
    const hidden: EmailLabel[] = [];

    userLabels.forEach((label) => {
      if (isHidden(label)) {
        hidden.push(label);
      } else {
        visible.push(label);
      }
    });

    return {
      visibleLabels: visible,
      hiddenLabels: hidden,
    };
  }, [userLabels]);

  return {
    visibleLabels,
    hiddenLabels,
    isLoading,
    error,
    mutate,
  };
}

function sortLabels(a: SortableLabel, b: SortableLabel) {
  const aName = a.name || "";
  const bName = b.name || "";

  // Order words that start with [ at the end
  if (aName.startsWith("[") && !bName.startsWith("[")) return 1;
  if (!aName.startsWith("[") && bName.startsWith("[")) return -1;

  return aName.localeCompare(bName);
}
