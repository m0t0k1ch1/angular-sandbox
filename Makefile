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

.PHONY: dev
dev:
	pnpm ng serve -c dev

.PHONY: build/prod
build/prod:
	pnpm ng build -c prod
