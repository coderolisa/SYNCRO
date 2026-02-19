.PHONY: build test clean help

help:
	@echo "Virtual Card Interface Contract"
	@echo ""
	@echo "Available targets:"
	@echo "  build       - Build the contract"
	@echo "  test        - Run tests"
	@echo "  clean       - Clean build artifacts"
	@echo "  optimize    - Build with optimizations"
	@echo "  docs        - Generate documentation"

build:
	cargo build --target wasm32-unknown-unknown --release

test:
	cargo test --lib

clean:
	cargo clean

optimize:
	cargo build --target wasm32-unknown-unknown --release
	@echo "Build complete: target/wasm32-unknown-unknown/release/virtual_card.wasm"

docs:
	cargo doc --no-deps --open
