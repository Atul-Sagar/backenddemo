

const generateSamplePosts = async (pool) => {
  try {
    console.log('Generating sample posts...');

    // Sample categories (should match what you inserted)
    const categories = [
      { id: 1, name: 'Technology', slug: 'technology' },
      { id: 2, name: 'Lifestyle', slug: 'lifestyle' },
      { id: 3, name: 'Travel', slug: 'travel' },
      { id: 4, name: 'Food', slug: 'food' }
    ];

    // Sample posts data
    const samplePosts = [
      {
        title: "Getting Started with React",
        content: "React is a popular JavaScript library for building user interfaces. In this post, we'll explore the basics of React components, state, and props.",
        excerpt: "Learn the fundamentals of React and how to build your first component.",
        slug: "getting-started-with-react",
        author: "John Doe",
        featured_image: "https://picsum.photos/800/400?random=1",
        is_published: true
      },
      {
        title: "The Art of Cooking Pasta",
        content: "Cooking perfect pasta is both a science and an art. From choosing the right pasta shape to mastering the al dente texture, this guide covers everything you need to know.",
        excerpt: "Master the techniques for cooking perfect pasta every time.",
        slug: "art-of-cooking-pasta",
        author: "Maria Garcia",
        featured_image: "https://picsum.photos/800/400?random=2",
        is_published: true
      },
      {
        title: "Traveling on a Budget",
        content: "You don't need to be rich to see the world. Here are practical tips for traveling on a budget without sacrificing experiences.",
        excerpt: "Discover how to travel the world without breaking the bank.",
        slug: "traveling-on-budget",
        author: "Alex Chen",
        featured_image: "https://picsum.photos/800/400?random=3",
        is_published: true
      },
      {
        title: "Introduction to Node.js",
        content: "Node.js has revolutionized backend development. Learn about its event-driven architecture and how to build scalable applications.",
        excerpt: "A beginner's guide to Node.js and its core concepts.",
        slug: "introduction-to-nodejs",
        author: "Sarah Johnson",
        featured_image: "https://picsum.photos/800/400?random=4",
        is_published: true
      },
      {
        title: "Morning Routine for Productivity",
        content: "How you start your day determines your productivity. Here's a morning routine that successful people swear by.",
        excerpt: "Optimize your morning routine for maximum productivity.",
        slug: "morning-routine-productivity",
        author: "David Wilson",
        featured_image: "https://picsum.photos/800/400?random=5",
        is_published: true
      },
      {
        title: "Best Hiking Trails in Colorado",
        content: "Colorado offers some of the most breathtaking hiking trails in the US. Here are our top picks for all skill levels.",
        excerpt: "Explore the most scenic hiking trails in Colorado.",
        slug: "best-hiking-trails-colorado",
        author: "Emily Roberts",
        featured_image: "https://picsum.photos/800/400?random=6",
        is_published: true
      },
      {
        title: "Python for Data Science",
        content: "Python has become the go-to language for data science. Learn about essential libraries like Pandas, NumPy, and Matplotlib.",
        excerpt: "Get started with Python for data analysis and visualization.",
        slug: "python-for-data-science",
        author: "Mike Thompson",
        featured_image: "https://picsum.photos/800/400?random=7",
        is_published: true
      },
      {
        title: "Healthy Smoothie Recipes",
        content: "Start your day with these nutritious and delicious smoothie recipes that are packed with vitamins and energy.",
        excerpt: "5 healthy smoothie recipes for breakfast or snacks.",
        slug: "healthy-smoothie-recipes",
        author: "Lisa Park",
        featured_image: "https://picsum.photos/800/400?random=8",
        is_published: true
      },
      {
        title: "Building RESTful APIs with Express",
        content: "Learn how to create robust RESTful APIs using Express.js, including routing, middleware, and error handling.",
        excerpt: "A comprehensive guide to building APIs with Express.js.",
        slug: "building-restful-apis-express",
        author: "Kevin Martinez",
        featured_image: "https://picsum.photos/800/400?random=9",
        is_published: true
      },
      {
        title: "Minimalist Lifestyle Benefits",
        content: "Embracing minimalism can lead to less stress and more fulfillment. Here's how to start your minimalist journey.",
        excerpt: "Discover the benefits of living with less.",
        slug: "minimalist-lifestyle-benefits",
        author: "Rachel Green",
        featured_image: "https://picsum.photos/800/400?random=10",
        is_published: true
      },
      {
        title: "Bali Travel Guide 2024",
        content: "Everything you need to know for your trip to Bali - from cultural etiquette to hidden gems off the tourist trail.",
        excerpt: "Your ultimate guide to traveling in Bali.",
        slug: "bali-travel-guide-2024",
        author: "Tom Anderson",
        featured_image: "https://picsum.photos/800/400?random=11",
        is_published: true
      },
      {
        title: "Vue.js vs React: Which to Choose?",
        content: "Comparing two popular frontend frameworks to help you decide which one fits your project needs.",
        excerpt: "A detailed comparison of Vue.js and React.",
        slug: "vuejs-vs-react-comparison",
        author: "Jennifer Lee",
        featured_image: "https://picsum.photos/800/400?random=12",
        is_published: true
      },
      {
        title: "Home Workout Routine",
        content: "No gym? No problem. This effective home workout routine requires minimal equipment and space.",
        excerpt: "Stay fit with this comprehensive home workout plan.",
        slug: "home-workout-routine",
        author: "Chris Taylor",
        featured_image: "https://picsum.photos/800/400?random=13",
        is_published: true
      },
      {
        title: "Italian Coffee Culture",
        content: "Discover the rich coffee traditions of Italy and learn how to make authentic Italian coffee at home.",
        excerpt: "Explore the art of Italian coffee making.",
        slug: "italian-coffee-culture",
        author: "Sophia Rossi",
        featured_image: "https://picsum.photos/800/400?random=14",
        is_published: true
      },
      {
        title: "Docker for Beginners",
        content: "Containerization made easy with Docker. Learn the basics and how to containerize your applications.",
        excerpt: "Get started with Docker and containerization.",
        slug: "docker-for-beginners",
        author: "Daniel Kim",
        featured_image: "https://picsum.photos/800/400?random=15",
        is_published: true
      },
      {
        title: "Digital Detox: Why and How",
        content: "Taking breaks from digital devices can improve mental health and relationships. Here's how to do a digital detox.",
        excerpt: "Learn the benefits of disconnecting from technology.",
        slug: "digital-detox-guide",
        author: "Amanda White",
        featured_image: "https://picsum.photos/800/400?random=16",
        is_published: true
      },
      {
        title: "Japanese Street Food Tour",
        content: "Explore the vibrant world of Japanese street food, from takoyaki to taiyaki and everything in between.",
        excerpt: "A culinary journey through Japan's street food scene.",
        slug: "japanese-street-food-tour",
        author: "Kenji Tanaka",
        featured_image: "https://picsum.photos/800/400?random=17",
        is_published: true
      },
      {
        title: "TypeScript Best Practices",
        content: "Writing better TypeScript code with these essential best practices and patterns.",
        excerpt: "Improve your TypeScript code with these tips.",
        slug: "typescript-best-practices",
        author: "Brian Clark",
        featured_image: "https://picsum.photos/800/400?random=18",
        is_published: true
      },
      {
        title: "Mindfulness Meditation Guide",
        content: "Learn how to practice mindfulness meditation to reduce stress and increase focus in your daily life.",
        excerpt: "Begin your mindfulness meditation practice.",
        slug: "mindfulness-meditation-guide",
        author: "Priya Patel",
        featured_image: "https://picsum.photos/800/400?random=19",
        is_published: true
      },
      {
        title: "Mexican Cuisine Essentials",
        content: "Master the fundamental techniques and ingredients of authentic Mexican cooking.",
        excerpt: "Explore the essentials of Mexican cuisine.",
        slug: "mexican-cuisine-essentials",
        author: "Carlos Mendez",
        featured_image: "https://picsum.photos/800/400?random=20",
        is_published: true
      },
      {
        title: "Cloud Computing Explained",
        content: "Understanding cloud computing models (IaaS, PaaS, SaaS) and when to use each one for your projects.",
        excerpt: "A clear explanation of cloud computing concepts.",
        slug: "cloud-computing-explained",
        author: "Nancy Drew",
        featured_image: "https://picsum.photos/800/400?random=21",
        is_published: false
      },
      {
        title: "Urban Gardening Tips",
        content: "Grow your own food even in small spaces with these urban gardening techniques and container gardening ideas.",
        excerpt: "Start your urban garden with these practical tips.",
        slug: "urban-gardening-tips",
        author: "Marcus Rivera",
        featured_image: "https://picsum.photos/800/400?random=22",
        is_published: true
      },
      {
        title: "GraphQL Introduction",
        content: "Learn how GraphQL provides a more efficient alternative to REST APIs with its flexible query language.",
        excerpt: "Get started with GraphQL for API development.",
        slug: "graphql-introduction",
        author: "Olivia Scott",
        featured_image: "https://picsum.photos/800/400?random=23",
        is_published: true
      }
    ];


    for (const post of samplePosts) {
      const postResult = await pool.query(
        `INSERT INTO posts (title, content, excerpt, slug, author, featured_image, is_published, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP - INTERVAL '${Math.floor(Math.random() * 365)} days', CURRENT_TIMESTAMP)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [post.title, post.content, post.excerpt, post.slug, post.author, post.featured_image, post.is_published]
      );

      if (postResult.rows.length > 0) {
        const postId = postResult.rows[0].id;
        

        const numCategories = Math.floor(Math.random() * 3) + 1;
        const assignedCategories = new Set();
        
        for (let i = 0; i < numCategories; i++) {
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          
          if (!assignedCategories.has(randomCategory.id)) {
            assignedCategories.add(randomCategory.id);
            
            await pool.query(
              `INSERT INTO post_categories (post_id, category_id) 
               VALUES ($1, $2) 
               ON CONFLICT (post_id, category_id) DO NOTHING`,
              [postId, randomCategory.id]
            );
          }
        }
      }
    }

    console.log('Sample posts generated successfully!');
  } catch (error) {
    console.error('Error generating sample posts:', error);
    throw error;
  }
};

module.exports = { generateSamplePosts };