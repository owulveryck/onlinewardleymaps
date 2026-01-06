# Makefile for converting OWM files to SVG and PNG
#
# Usage:
#   make          - Convert all .owm files in examples/ to SVG and PNG
#   make svg      - Convert all .owm files to SVG only
#   make png      - Convert all .owm files to PNG only
#   make clean    - Remove all generated files
#   make help     - Show this help message

# Configuration
EXAMPLES_DIR := examples
OUTPUT_DIR := $(EXAMPLES_DIR)
CLI := node src/index.js

# Find all .owm files in the examples directory
OWM_FILES := $(wildcard $(EXAMPLES_DIR)/*.owm)

# Generate target file lists
SVG_FILES := $(patsubst %.owm,%.svg,$(OWM_FILES))
PNG_FILES := $(patsubst %.owm,%.png,$(OWM_FILES))

# Default target - build everything
.PHONY: all
all: svg png
	@echo "✓ All conversions complete!"
	@echo "  Generated $(words $(SVG_FILES)) SVG files and $(words $(PNG_FILES)) PNG files"

# Build all SVG files
.PHONY: svg
svg: $(SVG_FILES)

# Build all PNG files
.PHONY: png
png: $(PNG_FILES)

# Pattern rule to convert .owm to .svg
$(OUTPUT_DIR)/%.svg: $(EXAMPLES_DIR)/%.owm
	@echo "Converting $< to SVG..."
	@$(CLI) $< --output $(basename $@) --format svg

# Pattern rule to convert .owm to .png
$(OUTPUT_DIR)/%.png: $(EXAMPLES_DIR)/%.owm
	@echo "Converting $< to PNG..."
	@$(CLI) $< --output $(basename $@) --format png

# Convert a specific file (usage: make convert FILE=examples/mymap.owm)
.PHONY: convert
convert:
ifndef FILE
	@echo "Error: Please specify FILE=path/to/file.owm"
	@exit 1
endif
	@echo "Converting $(FILE)..."
	@$(CLI) $(FILE) --output $(basename $(FILE)) --format both

# Clean generated files
.PHONY: clean
clean:
	@echo "Cleaning generated files..."
	@rm -f $(SVG_FILES) $(PNG_FILES)
	@echo "✓ Cleanup complete"

# Clean everything including test outputs
.PHONY: distclean
distclean: clean
	@echo "Cleaning all generated files..."
	@rm -f test-output.* test-map.txt
	@echo "✓ Deep cleanup complete"

# List all source files
.PHONY: list
list:
	@echo "OWM source files:"
	@for file in $(OWM_FILES); do \
		echo "  - $$file"; \
	done
	@echo ""
	@echo "Total: $(words $(OWM_FILES)) files"

# Show status of conversions
.PHONY: status
status:
	@echo "Conversion Status:"
	@echo "=================="
	@for owm in $(OWM_FILES); do \
		base=$${owm%.owm}; \
		svg="$$base.svg"; \
		png="$$base.png"; \
		printf "%-30s" "$$(basename $$owm)"; \
		if [ -f "$$svg" ]; then \
			printf " SVG:✓"; \
		else \
			printf " SVG:✗"; \
		fi; \
		if [ -f "$$png" ]; then \
			printf " PNG:✓"; \
		else \
			printf " PNG:✗"; \
		fi; \
		echo ""; \
	done

# Watch for changes and rebuild (requires entr or inotifywait)
.PHONY: watch
watch:
	@if command -v entr > /dev/null; then \
		echo "Watching for changes in $(EXAMPLES_DIR)..."; \
		echo "Press Ctrl+C to stop"; \
		ls $(EXAMPLES_DIR)/*.owm | entr -c make all; \
	else \
		echo "Error: 'entr' is not installed."; \
		echo "Install it with: brew install entr (on macOS)"; \
		exit 1; \
	fi

# Create a new example OWM file
.PHONY: new
new:
ifndef NAME
	@echo "Error: Please specify NAME=filename"
	@echo "Usage: make new NAME=my-map"
	@exit 1
endif
	@echo "Creating new example file: $(EXAMPLES_DIR)/$(NAME).owm"
	@echo "title $(NAME)" > $(EXAMPLES_DIR)/$(NAME).owm
	@echo "anchor User [0.95, 0.80]" >> $(EXAMPLES_DIR)/$(NAME).owm
	@echo "component Component A [0.75, 0.60]" >> $(EXAMPLES_DIR)/$(NAME).owm
	@echo "User->Component A" >> $(EXAMPLES_DIR)/$(NAME).owm
	@echo "style plain" >> $(EXAMPLES_DIR)/$(NAME).owm
	@echo "✓ Created $(EXAMPLES_DIR)/$(NAME).owm"

# Install dependencies
.PHONY: install
install:
	@echo "Installing dependencies..."
	@npm install
	@npx playwright install chromium
	@echo "✓ Installation complete"

# Help target
.PHONY: help
help:
	@echo "OWM CLI - Makefile Help"
	@echo "======================="
	@echo ""
	@echo "Available targets:"
	@echo "  make              - Convert all .owm files to SVG and PNG (default)"
	@echo "  make all          - Same as default"
	@echo "  make svg          - Convert all .owm files to SVG only"
	@echo "  make png          - Convert all .owm files to PNG only"
	@echo "  make convert FILE=examples/map.owm - Convert a specific file"
	@echo "  make clean        - Remove all generated SVG and PNG files"
	@echo "  make distclean    - Remove all generated files including tests"
	@echo "  make list         - List all .owm source files"
	@echo "  make status       - Show conversion status for all files"
	@echo "  make watch        - Watch for changes and auto-rebuild (requires entr)"
	@echo "  make new NAME=map - Create a new example OWM file"
	@echo "  make install      - Install CLI dependencies"
	@echo "  make help         - Show this help message"
	@echo ""
	@echo "Configuration:"
	@echo "  EXAMPLES_DIR = $(EXAMPLES_DIR)"
	@echo "  OWM_FILES    = $(words $(OWM_FILES)) files"
	@echo ""
	@echo "Example workflows:"
	@echo "  1. Convert all files:     make"
	@echo "  2. Convert one file:      make convert FILE=examples/tea-shop.owm"
	@echo "  3. Check what's built:    make status"
	@echo "  4. Clean and rebuild:     make clean && make"
	@echo "  5. Create new example:    make new NAME=my-new-map"

# Declare phony targets to avoid conflicts with files
.PHONY: all svg png convert clean distclean list status watch new install help

# Print variables (for debugging)
.PHONY: debug
debug:
	@echo "OWM_FILES = $(OWM_FILES)"
	@echo "SVG_FILES = $(SVG_FILES)"
	@echo "PNG_FILES = $(PNG_FILES)"
