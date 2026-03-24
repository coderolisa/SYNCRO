-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Add JSONB index for metadata queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata ON audit_logs USING GIN (metadata);

-- Set table permissions (adjust roles as needed)
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT SELECT ON audit_logs TO postgres;

-- Create a view for admin access with user details (if profiles table exists)
CREATE OR REPLACE VIEW audit_logs_with_user_details AS
SELECT 
  al.id,
  al.user_id,
  COALESCE(p.email, 'Unknown') as user_email,
  al.action,
  al.resource_type,
  al.resource_id,
  al.metadata,
  al.ip_address,
  al.user_agent,
  al.created_at
FROM audit_logs al
LEFT JOIN profiles p ON al.user_id = p.id
ORDER BY al.created_at DESC;
