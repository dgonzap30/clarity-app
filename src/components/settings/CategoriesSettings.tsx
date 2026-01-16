import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Trash2,
  Edit2,
  Palette,
  RotateCcw,
  GraduationCap,
  User,
  Wine,
  Car,
  Briefcase,
  Heart,
  Film,
  HelpCircle,
  Home,
  ShoppingCart,
  Utensils,
  Coffee,
  Plane,
  Gift,
  Gamepad2,
  Music,
  Book,
  Dumbbell,
  Shirt,
  Smartphone,
  Wrench,
  Baby,
  PiggyBank,
  CreditCard,
  Receipt,
} from 'lucide-react';
import type { UseSettingsReturn } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { PRESET_COLORS, CATEGORY_ICONS } from '@/lib/category-presets';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { isDefaultCategoryId } from '@/types';
import type { CategoryId, Category } from '@/types';
import { cn } from '@/lib/utils';

// Icon mapping for dynamic rendering
const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  User,
  Wine,
  Car,
  Briefcase,
  Heart,
  Film,
  HelpCircle,
  Home,
  ShoppingCart,
  Utensils,
  Coffee,
  Plane,
  Gift,
  Gamepad2,
  Music,
  Book,
  Dumbbell,
  Shirt,
  Smartphone,
  Wrench,
  Baby,
  PiggyBank,
  CreditCard,
  Receipt,
};

interface CategoriesSettingsProps {
  settingsHook: UseSettingsReturn;
}

interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
}

const initialFormData: CategoryFormData = {
  name: '',
  color: PRESET_COLORS[8].hex, // Blue default
  icon: 'HelpCircle',
};

export function CategoriesSettings({ settingsHook }: CategoriesSettingsProps) {
  const { settings, addCategory, updateCategory, deleteCategory, restoreCategory, resetCategoryToDefault } =
    settingsHook;
  const { categoryList } = useCategories(settings);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<CategoryId | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<CategoryId | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  // Get deleted default categories
  const deletedDefaults = settings.categoryOverrides.filter((o) => o.isDeleted);

  // Sort categories: custom first, then defaults, uncategorized last
  const sortedCategories = [...categoryList].sort((a, b) => {
    if (a.id === 'uncategorized') return 1;
    if (b.id === 'uncategorized') return -1;
    if (a.isDefault === b.isDefault) return a.name.localeCompare(b.name);
    return a.isDefault ? 1 : -1;
  });

  const handleOpenAddDialog = () => {
    setFormData(initialFormData);
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (categoryId: CategoryId) => {
    const category = categoryList.find((c) => c.id === categoryId);
    if (category) {
      setFormData({
        name: category.name,
        color: category.color,
        icon: category.icon,
      });
      setEditingCategoryId(categoryId);
    }
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingCategoryId(null);
    setFormData(initialFormData);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingCategoryId) {
      updateCategory(editingCategoryId, {
        name: formData.name.trim(),
        color: formData.color,
        icon: formData.icon,
      });
    } else {
      addCategory({
        name: formData.name.trim(),
        color: formData.color,
        icon: formData.icon,
      });
    }

    handleCloseDialog();
  };

  const handleDelete = (categoryId: CategoryId) => {
    if (settings.preferences.confirmDestructiveActions) {
      setDeleteConfirmId(categoryId);
    } else {
      deleteCategory(categoryId);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteCategory(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleRestore = (categoryId: CategoryId) => {
    restoreCategory(categoryId);
  };

  const handleReset = (categoryId: CategoryId) => {
    resetCategoryToDefault(categoryId);
  };

  // Check if a default category has been modified
  const isModified = (categoryId: CategoryId): boolean => {
    if (!isDefaultCategoryId(categoryId)) return false;
    return settings.categoryOverrides.some((o) => o.id === categoryId && !o.isDeleted);
  };

  return (
    <div className="space-y-6">
      {/* Categories Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Categories</CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={handleOpenAddDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Add Category
            </Button>
          </div>
          <CardDescription>Manage spending categories for organizing transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedCategories.map((category) => {
            const Icon = ICON_COMPONENTS[category.icon] || HelpCircle;
            const isDefault = category.isDefault;
            const modified = isModified(category.id);
            const isUncategorized = category.id === 'uncategorized';

            return (
              <div
                key={category.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Color & Icon */}
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{category.name}</div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1">
                  {isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                  {modified && (
                    <Badge variant="outline" className="text-xs">
                      Modified
                    </Badge>
                  )}
                  {!isDefault && (
                    <Badge variant="default" className="text-xs">
                      Custom
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {modified && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleReset(category.id)}
                      title="Reset to default"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleOpenEditDialog(category.id)}
                    disabled={isUncategorized}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(category.id)}
                    disabled={isUncategorized}
                    title={isUncategorized ? 'Cannot delete uncategorized' : 'Delete category'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Deleted Categories (for restoration) */}
      {deletedDefaults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground">Deleted Categories</CardTitle>
            <CardDescription>Default categories that have been removed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {deletedDefaults.map((override) => {
              const defaultCat = Object.values(DEFAULT_CATEGORIES).find((c: Category) => c.id === override.id);
              const displayName = defaultCat?.name || override.id;

              return (
                <div
                  key={override.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-dashed bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-muted-foreground">{displayName}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleRestore(override.id)}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || !!editingCategoryId} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategoryId ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editingCategoryId
                ? 'Update the category name, color, and icon.'
                : 'Create a new category for organizing your transactions.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                placeholder="e.g., Groceries"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-all hover:scale-110',
                      formData.color === color.hex
                        ? 'border-foreground scale-110'
                        : 'border-transparent'
                    )}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setFormData({ ...formData, color: color.hex })}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                {CATEGORY_ICONS.map((iconName) => {
                  const Icon = ICON_COMPONENTS[iconName] || HelpCircle;
                  return (
                    <Button
                      key={iconName}
                      type="button"
                      variant={formData.icon === iconName ? 'default' : 'outline'}
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setFormData({ ...formData, icon: iconName })}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
                >
                  {(() => {
                    const PreviewIcon = ICON_COMPONENTS[formData.icon] || HelpCircle;
                    return <PreviewIcon className="h-4 w-4" />;
                  })()}
                </div>
                <span className="font-medium text-sm">
                  {formData.name || 'Category Name'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
              {editingCategoryId ? 'Save Changes' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmId && isDefaultCategoryId(deleteConfirmId)
                ? 'This will hide the category. You can restore it later from the "Deleted Categories" section.'
                : 'This will permanently delete the category. Transactions assigned to this category will be moved to "Uncategorized".'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
