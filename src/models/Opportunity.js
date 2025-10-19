const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class Opportunity {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.description = data.description;
    this.organization = data.organization;
    this.url = data.url;
    this.opportunity_type = data.opportunity_type;
    this.country = data.country;
    this.region = data.region;
    this.application_deadline = data.application_deadline;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.amount_min = data.amount_min;
    this.amount_max = data.amount_max;
    this.currency = data.currency || 'USD';
    this.eligibility_criteria = data.eligibility_criteria;
    this.application_requirements = data.application_requirements;
    this.benefits = data.benefits;
    this.tags = data.tags || [];
    this.source_domain = data.source_domain;
    this.raw_content = data.raw_content;
    this.extracted_data = data.extracted_data || {};
    this.status = data.status || 'active';
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
    this.last_crawled_at = data.last_crawled_at || new Date();
  }

  // Validate the opportunity data
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!this.url || !this.isValidUrl(this.url)) {
      errors.push('Valid URL is required');
    }

    if (!this.opportunity_type || this.opportunity_type.trim().length === 0) {
      errors.push('Opportunity type is required');
    }

    if (this.application_deadline && !this.isValidDate(this.application_deadline)) {
      errors.push('Invalid application deadline format');
    }

    if (this.amount_min && this.amount_min < 0) {
      errors.push('Minimum amount cannot be negative');
    }

    if (this.amount_max && this.amount_max < 0) {
      errors.push('Maximum amount cannot be negative');
    }

    if (this.amount_min && this.amount_max && this.amount_min > this.amount_max) {
      errors.push('Minimum amount cannot be greater than maximum amount');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  isValidDate(dateString) {
    return moment(dateString, 'YYYY-MM-DD', true).isValid();
  }

  // Convert to database format
  toDatabaseFormat() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      organization: this.organization,
      url: this.url,
      opportunity_type: this.opportunity_type,
      country: this.country,
      region: this.region,
      application_deadline: this.application_deadline,
      start_date: this.start_date,
      end_date: this.end_date,
      amount_min: this.amount_min,
      amount_max: this.amount_max,
      currency: this.currency,
      eligibility_criteria: this.eligibility_criteria,
      application_requirements: this.application_requirements,
      benefits: this.benefits,
      tags: this.tags,
      source_domain: this.source_domain,
      raw_content: this.raw_content,
      extracted_data: this.extracted_data,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      last_crawled_at: this.last_crawled_at
    };
  }

  // Create from database row
  static fromDatabaseRow(row) {
    return new Opportunity({
      id: row.id,
      title: row.title,
      description: row.description,
      organization: row.organization,
      url: row.url,
      opportunity_type: row.opportunity_type,
      country: row.country,
      region: row.region,
      application_deadline: row.application_deadline,
      start_date: row.start_date,
      end_date: row.end_date,
      amount_min: row.amount_min,
      amount_max: row.amount_max,
      currency: row.currency,
      eligibility_criteria: row.eligibility_criteria,
      application_requirements: row.application_requirements,
      benefits: row.benefits,
      tags: row.tags,
      source_domain: row.source_domain,
      raw_content: row.raw_content,
      extracted_data: row.extracted_data,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_crawled_at: row.last_crawled_at
    });
  }

  // Check if opportunity is expired
  isExpired() {
    if (!this.application_deadline) return false;
    return moment().isAfter(moment(this.application_deadline));
  }

  // Get days until deadline
  getDaysUntilDeadline() {
    if (!this.application_deadline) return null;
    return moment(this.application_deadline).diff(moment(), 'days');
  }

  // Format for API response
  toApiResponse() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      organization: this.organization,
      url: this.url,
      opportunity_type: this.opportunity_type,
      country: this.country,
      region: this.region,
      application_deadline: this.application_deadline,
      start_date: this.start_date,
      end_date: this.end_date,
      amount: {
        min: this.amount_min,
        max: this.amount_max,
        currency: this.currency
      },
      eligibility_criteria: this.eligibility_criteria,
      application_requirements: this.application_requirements,
      benefits: this.benefits,
      tags: this.tags,
      source_domain: this.source_domain,
      status: this.status,
      is_expired: this.isExpired(),
      days_until_deadline: this.getDaysUntilDeadline(),
      created_at: this.created_at,
      updated_at: this.updated_at,
      last_crawled_at: this.last_crawled_at
    };
  }
}

module.exports = Opportunity;
