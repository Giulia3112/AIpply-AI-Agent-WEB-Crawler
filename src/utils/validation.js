const Joi = require('joi');

// Validation schemas
const searchOpportunitiesSchema = Joi.object({
  query: Joi.string().min(3).max(500).required().messages({
    'string.min': 'Query must be at least 3 characters long',
    'string.max': 'Query must not exceed 500 characters',
    'any.required': 'Query is required'
  }),
  filters: Joi.object({
    country: Joi.string().max(100).optional(),
    type: Joi.string().valid(
      'scholarship', 'fellowship', 'grant', 'accelerator', 
      'internship', 'competition', 'award', 'other'
    ).optional(),
    amount_min: Joi.number().min(0).optional(),
    amount_max: Joi.number().min(0).optional(),
    currency: Joi.string().length(3).uppercase().optional(),
    deadline_after: Joi.date().iso().optional(),
    deadline_before: Joi.date().iso().optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
  }).optional()
});

const opportunityIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid opportunity ID format',
    'any.required': 'Opportunity ID is required'
  })
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort_by: Joi.string().valid(
    'created_at', 'updated_at', 'application_deadline', 
    'title', 'amount_min', 'amount_max'
  ).default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc')
});

const opportunityFiltersSchema = Joi.object({
  type: Joi.string().valid(
    'scholarship', 'fellowship', 'grant', 'accelerator', 
    'internship', 'competition', 'award', 'other'
  ).optional(),
  country: Joi.string().max(100).optional(),
  region: Joi.string().max(100).optional(),
  status: Joi.string().valid('active', 'expired', 'closed', 'duplicate').optional(),
  amount_min: Joi.number().min(0).optional(),
  amount_max: Joi.number().min(0).optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  deadline_after: Joi.date().iso().optional(),
  deadline_before: Joi.date().iso().optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  search: Joi.string().max(200).optional()
});

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errorDetails
      });
    }

    req[property] = value;
    next();
  };
};

// Custom validation functions
const validateOpportunityData = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(500).required(),
    description: Joi.string().max(5000).optional(),
    organization: Joi.string().max(300).optional(),
    url: Joi.string().uri().max(1000).required(),
    opportunity_type: Joi.string().valid(
      'scholarship', 'fellowship', 'grant', 'accelerator', 
      'internship', 'competition', 'award', 'other'
    ).required(),
    country: Joi.string().max(100).optional(),
    region: Joi.string().max(100).optional(),
    application_deadline: Joi.date().iso().optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    amount_min: Joi.number().min(0).optional(),
    amount_max: Joi.number().min(0).optional(),
    currency: Joi.string().length(3).uppercase().default('USD'),
    eligibility_criteria: Joi.string().max(2000).optional(),
    application_requirements: Joi.string().max(2000).optional(),
    benefits: Joi.string().max(2000).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    source_domain: Joi.string().max(200).optional(),
    raw_content: Joi.string().max(100000).optional(),
    extracted_data: Joi.object().optional(),
    status: Joi.string().valid('active', 'expired', 'closed', 'duplicate').default('active')
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  searchOpportunitiesSchema,
  opportunityIdSchema,
  paginationSchema,
  opportunityFiltersSchema,
  validateOpportunityData,
  validate
};
