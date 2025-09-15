"""
Tools package initialization with tool registration

This module automatically registers all available SDK-compatible tools
"""

from ..registry import default_registry
from ..core import ToolConfig, ToolType

# Import available tool runners
from .readability_tool import ReadabilityToolRunner
from .cta_tool import CTAToolRunner
from .ad_copy_analyzer_tool import AdCopyAnalyzerToolRunner
from .compliance_checker_tool import ComplianceCheckerToolRunner
from .roi_copy_generator_tool import ROICopyGeneratorToolRunner
from .ab_test_generator_tool import ABTestGeneratorToolRunner
from .industry_optimizer_tool import IndustryOptimizerToolRunner

# Tool registration function
def register_all_tools():
    """Register all available tools with the default registry"""
    
    # Register Readability Analyzer
    try:
        config = ReadabilityToolRunner.default_config()
        default_registry.register_tool(ReadabilityToolRunner, config, replace_existing=True)
        print(f"✅ Registered tool: {config.name}")
    except Exception as e:
        print(f"❌ Failed to register ReadabilityToolRunner: {e}")
    
    # Register CTA Analyzer  
    try:
        config = CTAToolRunner.default_config()
        default_registry.register_tool(CTAToolRunner, config, replace_existing=True)
        print(f"✅ Registered tool: {config.name}")
    except Exception as e:
        print(f"❌ Failed to register CTAToolRunner: {e}")
    
    # Register Ad Copy Analyzer
    try:
        config = AdCopyAnalyzerToolRunner.default_config()
        default_registry.register_tool(AdCopyAnalyzerToolRunner, config, replace_existing=True)
        print(f"✅ Registered tool: {config.name}")
    except Exception as e:
        print(f"❌ Failed to register AdCopyAnalyzerToolRunner: {e}")
    
    # Register Compliance Checker
    try:
        config = ComplianceCheckerToolRunner.default_config()
        default_registry.register_tool(ComplianceCheckerToolRunner, config, replace_existing=True)
        print(f"✅ Registered tool: {config.name}")
    except Exception as e:
        print(f"❌ Failed to register ComplianceCheckerToolRunner: {e}")
    
    # Register ROI Copy Generator
    try:
        config = ROICopyGeneratorToolRunner.default_config()
        default_registry.register_tool(ROICopyGeneratorToolRunner, config, replace_existing=True)
        print(f"✅ Registered tool: {config.name}")
    except Exception as e:
        print(f"❌ Failed to register ROICopyGeneratorToolRunner: {e}")
    
    # Register A/B Test Generator
    try:
        config = ABTestGeneratorToolRunner.default_config()
        default_registry.register_tool(ABTestGeneratorToolRunner, config, replace_existing=True)
        print(f"✅ Registered tool: {config.name}")
    except Exception as e:
        print(f"❌ Failed to register ABTestGeneratorToolRunner: {e}")
    
    # Register Industry Optimizer
    try:
        config = IndustryOptimizerToolRunner.default_config()
        default_registry.register_tool(IndustryOptimizerToolRunner, config, replace_existing=True)
        print(f"✅ Registered tool: {config.name}")
    except Exception as e:
        print(f"❌ Failed to register IndustryOptimizerToolRunner: {e}")

# Auto-register tools when module is imported
register_all_tools()

# Export the tools for direct import
__all__ = [
    'ReadabilityToolRunner',
    'CTAToolRunner',
    'AdCopyAnalyzerToolRunner',
    'ComplianceCheckerToolRunner',
    'ROICopyGeneratorToolRunner',
    'ABTestGeneratorToolRunner',
    'IndustryOptimizerToolRunner',
    'register_all_tools'
]
