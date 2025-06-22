# 🚀 **Environment Variables Setup Guide**

## **Step 1: Configure Supabase Edge Function Environment Variables**

To activate the **full Gemini AI pipeline** for Product Hunt database search, you need to configure these environment variables:

### **Supabase Dashboard Setup**:

1. **Navigate to**: [Supabase Dashboard](https://supabase.com/dashboard/project/asdxyjnmgkhsznzrbcxv/functions)
2. **Click**: `similarity-search` function  
3. **Click**: **Settings** tab
4. **Add Environment Variables**:

```bash
VITE_SUPABASE_URL_2=https://vryersltsbjkdqhvorgk.supabase.co
VITE_SUPABASE_ANON_TOKEN_2=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeWVyc2x0c2Jqa2RxaHZvcmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDk3NDIsImV4cCI6MjA2NTkyNTc0Mn0.3B4oZUOh9pTxeFls5wSc8gmrrA97tbudn796jXPXN6k
VITE_GEMINI_API_TOKEN_3=AIzaSyDg-oTCk4HqAGI27rJJRTPQ7_Ov3veHa7w
```

5. **Click**: "Save"
6. **Redeploy function** (if needed):
   ```bash
   npx supabase functions deploy similarity-search --project-ref asdxyjnmgkhsznzrbcxv
   ```

## **What This Enables**:

### 🤖 **5-Step Gemini AI Pipeline**:

1. **Gemini Tag Generation**: Your idea → Gemini → Smart tags/keywords
2. **Tag-based Search**: Search 120,000 Product Hunt products by category tags  
3. **Description Filtering**: Filter by Gemini-generated description keywords
4. **Intelligent Scoring**: Multi-factor relevance scoring (tags 40%, names 30%, desc 20%, keywords 10%)
5. **Final Gemini Ranking**: AI-powered final ranking by market fit & relevance

### 📊 **Product Hunt Database**:
- **120,000 real Product Hunt ideas**
- **Upvotes, categories, websites, descriptions**
- **AI-powered similarity matching**
- **Smart competitive analysis**

---

## **Step 2: Test the System**

After setting environment variables:

1. **Go to**: Your app → Ideas page
2. **Click**: "🔍 Find Similar Ideas" 
3. **Search for**: "AR fidget spinner" or any startup idea
4. **You should see**: Real Product Hunt products with upvotes, categories, and Gemini AI rankings!

---

## **Fallback Mode**

If environment variables aren't set, the system works in **fallback mode**:
- ⚠️ **"Using fallback search"** warning shown
- Searches your local ideas database instead  
- Still functional, but not the full Product Hunt experience

---

## **Environment Variables Explained**:

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL_2` | Product Hunt database connection |
| `VITE_SUPABASE_ANON_TOKEN_2` | Authentication for 120k products |
| `VITE_GEMINI_API_TOKEN_3` | AI-powered intelligent ranking |

**🎯 Once configured, you'll have the most advanced startup idea similarity search system powered by 120,000 Product Hunt products and Gemini AI!** 