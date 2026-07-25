# Gummy OS Protocol Examples

## Canonical Protocol 0.2 examples

- `hayden.actor.json`
- `hayden.mold.json`
- `welcome.gummy.json`
- `builders.bowl.json`
- `welcome-created-by.link.json`
- `welcome.grab.json`
- `welcome-copy.gummy.json`
- `welcome-copy-grab-of.link.json`

These demonstrate the accepted object language:

```text
Actor
Mold
Gummy
Bowl
Link
Grab
```

The Grab example is a set:

```text
source Gummy
→ Grab record
→ result Gummy
→ grab-of Link
```

The source remains unchanged.

## Legacy Protocol 0.1 examples

Files such as `hayden.snack.json` remain as migration inputs. They are not current product-language examples.

The Cursor implementation must read them deterministically and produce Protocol 0.2 objects without deleting legacy evidence before migration parity is verified.
