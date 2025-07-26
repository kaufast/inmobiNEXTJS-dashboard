
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Plus, Trash } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';

interface ChecklistItem {
  id: number;
  title: string;
  completed: boolean;
}

interface WishlistChecklistProps {
  wishlistId: number;
  items: ChecklistItem[];
  onAddItem: (title: string) => void;
  onToggleItem: (id: number) => void;
  onDeleteItem: (id: number) => void;
}

export function WishlistChecklist({
  wishlistId,
  items,
  onAddItem,
  onToggleItem,
  onDeleteItem
}: WishlistChecklistProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [newItemTitle, setNewItemTitle] = useState('');

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      onAddItem(newItemTitle.trim());
      setNewItemTitle('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder={t('wishlist.checklistItemPlaceholder')}
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
        />
        <Button onClick={handleAddItem} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border p-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => onToggleItem(item.id)}
              />
              <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                {item.title}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteItem(item.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
