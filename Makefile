.PHONY: setup
setup: deps

.PHONY: deps
deps:
	pnpm install --frozen-lockfile

.PHONY: commit
commit:
	pnpm czg

.PHONY: clean
clean:
	pnpm ng cache clean

.PHONY: start
start:
	pnpm ng serve --port 4300
