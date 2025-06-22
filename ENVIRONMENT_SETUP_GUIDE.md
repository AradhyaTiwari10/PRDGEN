# 🔧 Environment Setup Guide

## 🚨 **Current Issue**
Your similarity search is returning **0 results** because the environment variables for the Product Hunt database (120,000 products) are not configured in Supabase Edge Functions.

## ✅ **Required Environment Variables**

You need to set these 3 environment variables in your **Supabase Edge Function settings**:

```bash
VITE_SUPABASE_URL_2=your_product_hunt_database_url
VITE_SUPABASE_ANON_KEY_2=your_product_hunt_database_key  
VITE_GEMINI_API_KEY_3=your_gemini_api_key_for_search
```

## 📋 **Step-by-Step Setup**

### **Step 1: Access Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `asdxyjnmgkhsznzrbcxv`
3. Navigate to **Functions** → **similarity-search** → **Settings**

### **Step 2: Set Environment Variables**
In the **Environment Variables** section, add:

#### **Variable 1: Product Hunt Database URL**
```
Name: VITE_SUPABASE_URL_2
Value: [Your Product Hunt database URL]
```

#### **Variable 2: Product Hunt Database Key** 
```
Name: VITE_SUPABASE_ANON_KEY_2
Value: [Your Product Hunt database anon key]
```

#### **Variable 3: Gemini API Key**
```
Name: VITE_GEMINI_API_KEY_3  
Value: [Your Gemini API key for search analysis]
```

### **Step 3: Get the Required Values**

#### **For Product Hunt Database:**
- You need access to a Supabase database containing 120,000 Product Hunt products
- Table name should be: `product_hunt_products`
- Required columns: `id`, `name`, `product_description`, `category_tags`, `upvotes`, `websites`, `makers`

#### **For Gemini API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIza...`)

### **Step 4: Save and Deploy**
1. Click **Save** in the Environment Variables section
2. The function will automatically restart with new variables

---

## 🧪 **Testing Setup**

After setting up the environment variables, test the search:

1. **Go to**: `http://localhost:5173` → Similar Ideas tab
2. **Search for**: `"AR fidget spinner"`
3. **Expected result**: Should find relevant products with good similarity scores

---

## 🔍 **Diagnostic Information**

### **Current Status:**
- ✅ Edge Function deployed successfully
- ❌ Environment variables not configured
- ❌ Product Hunt database not accessible
- ❌ Gemini AI not available

### **What Happens Without Environment Variables:**
- Function falls back to local database (your ideas only)
- Returns 0 results if your local database is empty
- Shows "Using fallback search" message

### **What Happens With Proper Setup:**
- Searches 120,000+ Product Hunt products
- Uses Gemini AI for intelligent analysis
- Returns highly relevant results with good rankings

---

## 🆘 **If You Don't Have Product Hunt Database**

If you don't have access to the Product Hunt database, I can help you:

1. **Option 1**: Create a sample database with test products
2. **Option 2**: Use web scraping to populate products
3. **Option 3**: Focus on improving search within your existing ideas

---

## 📞 **Next Steps**

1. **Set up environment variables** as described above
2. **Test the search** with "AR fidget spinner"
3. **Let me know** if you get results or need help getting the database

The similarity search should work perfectly once these variables are configured! 🚀 