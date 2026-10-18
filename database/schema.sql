DROP DATABASE IF EXISTS tasteful_blog;
CREATE DATABASE tasteful_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tasteful_blog;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  badge VARCHAR(50),
  steps TEXT,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  ingredient VARCHAR(100) NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  INDEX idx_ingredient (ingredient)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  user_id INT,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO recipes (title, description, image_url, badge, steps, likes) VALUES
('Rustic Margherita','San Marzano tomatoes, fresh mozzarella, basil.','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38','🍕 30 min','1. Make dough\n2. Add sauce\n3. Add mozzarella\n4. Bake 250°C 8 min\n5. Top with basil',124),
('Rainbow Buddha Bowl','Quinoa, chickpeas, avocado, tahini.','https://images.unsplash.com/photo-1547592180-85f173990554','🥗 vegan','1. Cook quinoa\n2. Roast chickpeas\n3. Slice avocado\n4. Assemble\n5. Drizzle tahini',98),
('Molten Lava Cake','Warm chocolate cake with gooey center.','https://images.unsplash.com/photo-1551024506-0bccd828d307','🍫 dessert','1. Melt chocolate\n2. Whisk eggs\n3. Combine\n4. Bake 220°C 12 min',212),
('Lemon Ricotta Pasta','Creamy ricotta, lemon zest, black pepper.','https://images.unsplash.com/photo-1563379926898-05f4575a45d8','🍝 pasta','1. Boil pasta\n2. Mix ricotta\n3. Toss\n4. Season',76),
('Garlic Butter Shrimp','Juicy shrimp in garlic butter.','https://images.unsplash.com/photo-1625943553852-781c6dd46faa','🦐 15 min','1. Heat butter\n2. Add garlic\n3. Add shrimp\n4. Add lemon\n5. Garnish',156),
('Tomato Basil Soup','Creamy roasted tomato soup.','https://images.unsplash.com/photo-1547592166-23ac45744acd','🍅 soup','1. Roast tomatoes\n2. Blend\n3. Simmer\n4. Add basil',88),
('Spaghetti Aglio e Olio','Garlic, olive oil, chili flakes.','https://images.unsplash.com/photo-1551183053-bf91a1d81141','🍝 20 min','1. Boil pasta\n2. Sauté garlic\n3. Add chili\n4. Toss\n5. Parsley',142),
('Paneer Butter Masala','Creamy Indian paneer curry.','https://images.unsplash.com/photo-1631452180519-c014fe946bc7','🍛 indian','1. Sauté onion+tomato\n2. Blend\n3. Add butter+cream\n4. Add paneer\n5. Simmer',204),
('Chicken Fried Rice','Quick fried rice with chicken and veggies.','https://images.unsplash.com/photo-1603133872878-684f208fb84b','🍚 25 min','1. Cook rice\n2. Scramble eggs\n3. Stir-fry chicken\n4. Add veggies\n5. Soy sauce',178),
('Avocado Toast Deluxe','Sourdough, avocado, egg, chili flakes.','https://images.unsplash.com/photo-1541519227354-08fa5d50c44d','🥑 breakfast','1. Toast bread\n2. Smash avocado\n3. Spread\n4. Top egg\n5. Chili flakes',132);

INSERT INTO recipe_ingredients (recipe_id, ingredient) VALUES
(1,'tomato'),(1,'mozzarella'),(1,'basil'),(1,'flour'),(1,'olive oil'),
(2,'quinoa'),(2,'chickpeas'),(2,'avocado'),(2,'tahini'),(2,'lemon'),
(3,'chocolate'),(3,'butter'),(3,'egg'),(3,'sugar'),(3,'flour'),
(4,'pasta'),(4,'ricotta'),(4,'lemon'),(4,'pepper'),(4,'parmesan'),
(5,'shrimp'),(5,'garlic'),(5,'butter'),(5,'lemon'),(5,'parsley'),
(6,'tomato'),(6,'basil'),(6,'garlic'),(6,'onion'),(6,'stock'),
(7,'spaghetti'),(7,'garlic'),(7,'olive oil'),(7,'chili flakes'),(7,'parsley'),
(8,'paneer'),(8,'tomato'),(8,'onion'),(8,'butter'),(8,'cream'),
(9,'rice'),(9,'chicken'),(9,'egg'),(9,'soy sauce'),(9,'carrot'),
(10,'bread'),(10,'avocado'),(10,'egg'),(10,'chili flakes'),(10,'lemon');
