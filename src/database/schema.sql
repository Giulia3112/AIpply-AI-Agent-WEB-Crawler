-- AIpply Crawler Database Schema

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    organization VARCHAR(300),
    url VARCHAR(1000) UNIQUE NOT NULL,
    opportunity_type VARCHAR(100) NOT NULL, -- scholarship, fellowship, grant, accelerator, etc.
    country VARCHAR(100),
    region VARCHAR(100),
    application_deadline DATE,
    start_date DATE,
    end_date DATE,
    amount_min DECIMAL(12,2),
    amount_max DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    eligibility_criteria TEXT,
    application_requirements TEXT,
    benefits TEXT,
    tags TEXT[], -- Array of tags for categorization
    source_domain VARCHAR(200),
    raw_content TEXT, -- Raw HTML content from Exa
    extracted_data JSONB, -- Structured data extracted from content
    status VARCHAR(20) DEFAULT 'active', -- active, expired, closed, duplicate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_queries table to track search history
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    filters JSONB,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create opportunity_searches junction table
CREATE TABLE IF NOT EXISTS opportunity_searches (
    search_id UUID REFERENCES search_queries(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3,2), -- 0.00 to 1.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (search_id, opportunity_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_country ON opportunities(country);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(application_deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_tags ON opportunities USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_opportunities_extracted_data ON opportunities USING GIN(extracted_data);
CREATE INDEX IF NOT EXISTS idx_opportunities_url ON opportunities(url);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_opportunities_search ON opportunities 
USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(organization, '')));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON opportunities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO opportunities (
    title, 
    description, 
    organization, 
    url, 
    opportunity_type, 
    country, 
    application_deadline,
    amount_min,
    amount_max,
    currency,
    tags,
    source_domain
) VALUES 
(
    'Women in STEM Scholarship 2025',
    'A comprehensive scholarship program supporting women pursuing degrees in Science, Technology, Engineering, and Mathematics fields.',
    'STEM Foundation',
    'https://example.com/women-stem-scholarship-2025',
    'scholarship',
    'United States',
    '2025-03-15',
    5000.00,
    10000.00,
    'USD',
    ARRAY['women', 'stem', 'scholarship', '2025'],
    'example.com'
),
(
    'Tech Innovation Fellowship',
    'A 12-month fellowship program for emerging tech entrepreneurs with innovative ideas.',
    'Tech Innovation Hub',
    'https://example.com/tech-innovation-fellowship',
    'fellowship',
    'Global',
    '2025-02-28',
    25000.00,
    50000.00,
    'USD',
    ARRAY['fellowship', 'tech', 'innovation', 'entrepreneurship'],
    'example.com'
) ON CONFLICT (url) DO NOTHING;
