const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Get all validation errors
      stripUnknown: true, // Remove unknown fields
      convert: true // Convert types if possible
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors
        }
      });
    }

    next();
  };
};

// Auth validation schemas
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    })
});

// Product validation schemas
const createProductSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Product title is required'
    }),
  
  shortDescription: Joi.string()
    .trim()
    .max(300)
    .required()
    .messages({
      'string.max': 'Short description cannot exceed 300 characters',
      'any.required': 'Short description is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(5000)
    .required()
    .messages({
      'string.max': 'Description cannot exceed 5000 characters',
      'any.required': 'Product description is required'
    }),
  
  images: Joi.array()
    .items(
      Joi.string()
        .uri()
        .pattern(/^https?:\/\/.+/)
        .custom((value, helpers) => {
          // Check for unsafe schemes
          if (/javascript:/i.test(value)) {
            return helpers.error('string.unsafe');
          }
          
          // Check if it's a known CDN or has image extension
          const cdnPatterns = [
            /cloudinary\.com/,
            /imgix\.net/,
            /cloudflare\.com/,
            /amazonaws\.com/,
            /cloudfront\.net/,
            /imgur\.com/
          ];
          
          const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(value);
          const isCDN = cdnPatterns.some(pattern => pattern.test(value));
          
          if (!hasImageExtension && !isCDN) {
            return helpers.message('Image must be a valid image URL or from a known CDN');
          }
          
          return value;
        })
        .messages({
          'string.uri': 'Image must be a valid URL',
          'string.pattern.base': 'Image URL must start with http:// or https://',
          'string.unsafe': 'Image URL contains unsafe content'
        })
    )
    .min(1)
    .max(10)
    .messages({
      'array.min': 'At least one image is required',
      'array.max': 'Maximum 10 images allowed'
    }),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Price must be a positive number',
      'any.required': 'Price is required'
    }),
  
  // New affiliate links structure
  affiliateLinks: Joi.array()
    .items(
      Joi.object({
        url: Joi.string()
          .uri()
          .pattern(/^https?:\/\//)
          .custom((value, helpers) => {
            // Check for unsafe schemes
            if (/javascript:/i.test(value)) {
              return helpers.error('string.unsafe');
            }
            return value;
          })
          .required()
          .messages({
            'string.uri': 'Affiliate URL must be a valid URL',
            'string.pattern.base': 'Affiliate URL must start with http:// or https://',
            'string.unsafe': 'Affiliate URL contains unsafe content',
            'any.required': 'Affiliate URL is required'
          }),
        
        label: Joi.string()
          .trim()
          .max(50)
          .allow('')
          .messages({
            'string.max': 'Button label cannot exceed 50 characters'
          }),
        
        isPrimary: Joi.boolean()
          .default(false)
      })
    )
    .min(1)
    .max(10)
    .custom((value, helpers) => {
      // Check that only one link is marked as primary
      const primaryLinks = value.filter(link => link.isPrimary);
      if (primaryLinks.length > 1) {
        return helpers.error('array.multiplePrimary');
      }
      return value;
    })
    .required()
    .messages({
      'array.min': 'At least one affiliate link is required',
      'array.max': 'Maximum 10 affiliate links allowed',
      'array.multiplePrimary': 'Only one affiliate link can be marked as primary',
      'any.required': 'Affiliate links are required'
    }),

  // Legacy fields (optional for backwards compatibility)
  affiliateUrl: Joi.string()
    .uri()
    .pattern(/^https?:\/\//)
    .custom((value, helpers) => {
      // Check for unsafe schemes
      if (/javascript:/i.test(value)) {
        return helpers.error('string.unsafe');
      }
      return value;
    })
    .optional()
    .messages({
      'string.uri': 'Affiliate URL must be a valid URL',
      'string.pattern.base': 'Affiliate URL must start with http:// or https://',
      'string.unsafe': 'Affiliate URL contains unsafe content'
    }),
  
  categories: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(50)
        .messages({
          'string.max': 'Category name cannot exceed 50 characters'
        })
    )
    .max(5)
    .messages({
      'array.max': 'Maximum 5 categories allowed'
    }),
  
  tags: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(30)
        .messages({
          'string.max': 'Tag cannot exceed 30 characters'
        })
    )
    .max(10)
    .messages({
      'array.max': 'Maximum 10 tags allowed'
    }),
  
  featured: Joi.boolean()
    .default(false),
  
  metaTitle: Joi.string()
    .trim()
    .max(60)
    .messages({
      'string.max': 'Meta title cannot exceed 60 characters'
    }),
  
  metaDescription: Joi.string()
    .trim()
    .max(160)
    .messages({
      'string.max': 'Meta description cannot exceed 160 characters'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive', 'draft')
    .default('active')
});

const updateProductSchema = createProductSchema.fork(
  ['title', 'shortDescription', 'description', 'images', 'price', 'affiliateLinks', 'affiliateUrl'],
  (schema) => schema.optional()
);

// Query validation schemas
const productQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(12),
  
  search: Joi.string()
    .trim()
    .max(100),
  
  categories: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ),
  
  tags: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ),
  
  featured: Joi.boolean(),
  
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'title', 'price', 'clicks', 'conversions')
    .default('createdAt'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
});

// Track click validation schema
const trackClickSchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid product ID format',
      'any.required': 'Product ID is required'
    }),
  
  referrer: Joi.string()
    .uri()
    .allow('', null)
    .optional(),
  
  userAgent: Joi.string()
    .max(500)
    .allow('')
    .optional()
});

module.exports = {
  validate,
  loginSchema,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  trackClickSchema
};