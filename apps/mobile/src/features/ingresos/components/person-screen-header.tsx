import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";

type PersonScreenHeaderProps = {
  backHref?: string;
  title: string;
};

export function PersonScreenHeader({ backHref, title }: PersonScreenHeaderProps) {
  return (
    <AppScreenHeader
      backAccessibilityLabel={backHref === "/home" ? "Volver a home" : "Volver a general"}
      fallbackHref={(backHref ?? "/home") as never}
      title={title}
    />
  );
}
