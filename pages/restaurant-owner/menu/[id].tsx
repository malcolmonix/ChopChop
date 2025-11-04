import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useFirebaseAuth } from '../../../lib/context/firebase-auth.context';
import { restaurantAPI } from '../../../lib/services/restaurant-api';
import { imageUploadService } from '../../../lib/services/image-upload';
import type { Restaurant, MenuItem, MenuCategory } from '../../../lib/services/restaurant-api';

interface MenuItemFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  allergens: string[];
}

export default function RestaurantMenuEditor() {
  const router = useRouter();
  const { id: restaurantId } = router.query;
  const { user, loading: authLoading } = useFirebaseAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    allergens: [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load restaurant and menu data
  useEffect(() => {
    if (restaurantId && typeof restaurantId === 'string' && user && !authLoading) {
      loadData(restaurantId);
    }
  }, [restaurantId, user, authLoading]);

  const loadData = async (id: string) => {
    try {
      setLoading(true);
      const [restaurantData, items, categories] = await Promise.all([
        restaurantAPI.getRestaurant(id),
        restaurantAPI.getMenuItems(id),
        restaurantAPI.getMenuCategories(id),
      ]);

      if (!restaurantData) {
        setError('Restaurant not found');
        return;
      }

      setRestaurant(restaurantData);
      setMenuItems(items);
      setMenuCategories(categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      allergens: [],
    });
    setEditingItem(null);
    setShowAddForm(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || typeof restaurantId !== 'string') return;

    try {
      setLoading(true);

      // Upload image if selected
      let finalImageUrl = imagePreview;
      if (imageFile) {
        finalImageUrl = await handleImageUpload();
      }

      const itemData = {
        restaurantId,
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        category: formData.category || undefined,
        imageUrl: finalImageUrl || undefined,
        isAvailable: formData.isAvailable,
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        allergens: formData.allergens.length > 0 ? formData.allergens : undefined,
      };

      if (editingItem) {
        // Update existing item
        const updatedItem = await restaurantAPI.updateMenuItem(editingItem.id, itemData);
        setMenuItems(prev => prev.map(item =>
          item.id === editingItem.id ? { ...item, ...updatedItem } : item
        ));
      } else {
        // Create new item
        const newItem = await restaurantAPI.createMenuItem(itemData);
        setMenuItems(prev => [...prev, newItem]);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !restaurantId) return null;

    try {
      setUploadingImage(true);

      // Compress image before upload
      const compressedFile = await imageUploadService.compressImage(imageFile);

      // Upload to Firebase Storage
      const imageUrl = await imageUploadService.uploadMenuItemImage(
        restaurantId as string,
        editingItem?.id || `temp_${Date.now()}`,
        compressedFile
      );

      return imageUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || '',
      isAvailable: item.isAvailable,
      isVegetarian: item.isVegetarian || false,
      isVegan: item.isVegan || false,
      allergens: item.allergens || [],
    });
    setImagePreview(item.imageUrl || null);
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      setLoading(true);
      await restaurantAPI.deleteMenuItem(itemId);
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">Please sign in to access the menu editor.</p>
          <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-4">{error}</p>
          <Link href="/restaurant-owner/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Menu Editor - {restaurant?.name || 'Restaurant'}</title>
        <meta name="description" content="Edit your restaurant menu" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Menu Editor</h1>
                <p className="mt-2 text-gray-600">{restaurant?.name}</p>
              </div>
              <Link
                href="/restaurant-owner/dashboard"
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Items List */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Add Item
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {menuItems.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No menu items yet.</p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Add Your First Item
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {menuItems.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                              <div className="mt-2 flex items-center space-x-4">
                                <span className="font-semibold text-green-600">${item.price}</span>
                                <span className="text-sm text-gray-500">{item.category}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Add/Edit Form */}
            <div className="lg:col-span-1">
              {showAddForm && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                      </h2>
                      <button
                        onClick={resetForm}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={uploadingImage}
                        />
                        {uploadingImage && (
                          <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
                        )}
                        {imagePreview && (
                          <div className="mt-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isAvailable}
                            onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                            className="mr-2"
                          />
                          Available
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isVegetarian}
                            onChange={(e) => setFormData(prev => ({ ...prev, isVegetarian: e.target.checked }))}
                            className="mr-2"
                          />
                          Vegetarian
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isVegan}
                            onChange={(e) => setFormData(prev => ({ ...prev, isVegan: e.target.checked }))}
                            className="mr-2"
                          />
                          Vegan
                        </label>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                        </button>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}