import { create } from 'zustand';
import { cn } from '@shared/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastState {
  items: ToastItem[];
  show: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  items: [],
  show: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ items: [...state.items, { ...toast, id }] }));
    window.setTimeout(() => get().dismiss(id), 4000);
  },
  dismiss: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().show({ title, description, variant: 'success' }),
  error: (title: string, description?: string) =>
    useToastStore.getState().show({ title, description, variant: 'error' }),
  info: (title: string, description?: string) =>
    useToastStore.getState().show({ title, description, variant: 'info' }),
};

export function Toaster() {
  const items = useToastStore((state) => state.items);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => dismiss(item.id)}
          className={cn(
            'rounded-md border bg-card px-4 py-3 text-left text-sm shadow-lg',
            item.variant === 'error' && 'border-destructive/40 text-destructive',
            item.variant === 'success' && 'border-primary/40 text-foreground',
          )}
        >
          <span className="block font-medium">{item.title}</span>
          {item.description ? (
            <span className="mt-1 block text-muted-foreground">{item.description}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
