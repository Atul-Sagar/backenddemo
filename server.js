const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const { generateSamplePosts } = require('./sampleData')

const app = express();
const port = process.env.PORT || 5000;

// connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Middleware
app.use(cors());
app.use(express.json());


async function initializeDatabase() {
  try {
    // Create posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        slug VARCHAR(300) UNIQUE NOT NULL,
        author VARCHAR(100) DEFAULT 'Anonymous',
        featured_image VARCHAR(500),
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL
      )
    `);

    // Create post_categories junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_categories (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, category_id)
      )
    `);

    // Insert sample categories
    await pool.query(`
      INSERT INTO categories (name, slug) VALUES 
      ('Technology', 'technology'),
      ('Lifestyle', 'lifestyle'),
      ('Travel', 'travel'),
      ('Food', 'food')
      ON CONFLICT (name) DO NOTHING
    `);

    await generateSamplePosts(pool);

    console.log('✅ Blog database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Blog API is running',
    timestamp: new Date().toISOString()
  });
});

// GET all posts with pagination and filtering
app.get('/api/posts', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      published = true,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(DISTINCT c.*) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as categories,
        COUNT(*) OVER() as total_count
      FROM posts p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.is_published = $1
    `;
    
    const queryParams = [published];
    let paramCount = 1;

    // Add category filter
    if (category) {
      paramCount++;
      query += ` AND c.slug = $${paramCount}`;
      queryParams.push(category);
    }

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (p.title ILIKE $${paramCount} OR p.content ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += `
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);
    
    res.json({
      posts: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows[0] ? parseInt(result.rows[0].total_count) : 0,
        totalPages: Math.ceil((result.rows[0] ? parseInt(result.rows[0].total_count) : 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single post by ID or slug
app.get('/api/posts/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const isNumeric = /^\d+$/.test(identifier);
    const queryField = isNumeric ? 'p.id' : 'p.slug';
    
    const query = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(DISTINCT c.*) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as categories
      FROM posts p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE ${queryField} = $1
      GROUP BY p.id
    `;
    
    const result = await pool.query(query, [identifier]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE new post
app.post('/api/posts', async (req, res) => {
  try {
    const { 
      title, 
      content, 
      excerpt, 
      slug, 
      author, 
      featured_image, 
      is_published = true,
      category_ids = [] 
    } = req.body;
    
    if (!title || !content || !slug) {
      return res.status(400).json({ 
        error: 'Title, content, and slug are required' 
      });
    }

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert post
      const postResult = await client.query(
        `INSERT INTO posts 
         (title, content, excerpt, slug, author, featured_image, is_published) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [title, content, excerpt, slug, author, featured_image, is_published]
      );

      const post = postResult.rows[0];

      // Add categories if provided
      if (category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await client.query(
            'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)',
            [post.id, categoryId]
          );
        }
      }

      await client.query('COMMIT');
      
      // Fetch the complete post with categories
      const completePost = await pool.query(
        `SELECT 
          p.*,
          COALESCE(
            json_agg(DISTINCT c.*) FILTER (WHERE c.id IS NOT NULL),
            '[]'
          ) as categories
         FROM posts p
         LEFT JOIN post_categories pc ON p.id = pc.post_id
         LEFT JOIN categories c ON pc.category_id = c.id
         WHERE p.id = $1
         GROUP BY p.id`,
        [post.id]
      );

      res.status(201).json(completePost.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Slug already exists' });
    } else {
      console.error('Error creating post:', error);
      res.status(500).json({ error: error.message });
    }
  }
});

// UPDATE post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      content, 
      excerpt, 
      slug, 
      author, 
      featured_image, 
      is_published,
      category_ids = [] 
    } = req.body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update post
      const updateResult = await client.query(
        `UPDATE posts 
         SET title = $1, content = $2, excerpt = $3, slug = $4, 
             author = $5, featured_image = $6, is_published = $7,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 
         RETURNING *`,
        [title, content, excerpt, slug, author, featured_image, is_published, id]
      );

      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Post not found' });
      }

      // Update categories
      await client.query('DELETE FROM post_categories WHERE post_id = $1', [id]);
      
      if (category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await client.query(
            'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)',
            [id, categoryId]
          );
        }
      }

      await client.query('COMMIT');
      
      // Fetch updated post with categories
      const completePost = await pool.query(
        `SELECT 
          p.*,
          COALESCE(
            json_agg(DISTINCT c.*) FILTER (WHERE c.id IS NOT NULL),
            '[]'
          ) as categories
         FROM posts p
         LEFT JOIN post_categories pc ON p.id = pc.post_id
         LEFT JOIN categories c ON pc.category_id = c.id
         WHERE p.id = $1
         GROUP BY p.id`,
        [id]
      );

      res.json(completePost.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Slug already exists' });
    } else {
      console.error('Error updating post:', error);
      res.status(500).json({ error: error.message });
    }
  }
});

// DELETE post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ 
      message: 'Post deleted successfully', 
      post: result.rows[0] 
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// CATEGORY ROUTES

// GET all categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, slug } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *',
      [name, slug]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Category name or slug already exists' });
    } else {
      console.error('Error creating category:', error);
      res.status(500).json({ error: error.message });
    }
  }
});

// Start server
app.listen(port, async () => {
  console.log(`🚀 Blog API running on port ${port}`);
  await initializeDatabase();
});