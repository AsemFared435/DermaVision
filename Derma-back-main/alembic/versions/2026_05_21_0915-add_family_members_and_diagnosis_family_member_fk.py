"""Add family_members table and diagnosis family member relationship

Revision ID: 4b0d9c2e5f31
Revises: 1679c3c15756
Create Date: 2026-05-21 09:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4b0d9c2e5f31"
down_revision: Union[str, None] = "1679c3c15756"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


FAMILY_MEMBER_FK_NAME = "fk_diagnoses_family_member_id_family_members"
DIAGNOSIS_FAMILY_MEMBER_INDEX = "ix_diagnoses_family_member_id"


def _table_exists(inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _column_exists(inspector, table_name: str, column_name: str) -> bool:
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def _index_exists(inspector, table_name: str, index_name: str) -> bool:
    return any(index["name"] == index_name for index in inspector.get_indexes(table_name))


def _family_member_fk_exists(inspector) -> bool:
    for fk in inspector.get_foreign_keys("diagnoses"):
        if (
            fk.get("referred_table") == "family_members"
            and fk.get("constrained_columns") == ["family_member_id"]
        ):
            return True
    return False


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _table_exists(inspector, "family_members"):
        op.create_table(
            "family_members",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=100), nullable=False),
            sa.Column("relation", sa.String(length=50), nullable=False),
            sa.Column("date_of_birth", sa.Date(), nullable=True),
            sa.Column("gender", sa.String(length=10), nullable=True),
            sa.Column("notes", sa.String(length=500), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_family_members_id"), "family_members", ["id"], unique=False)
        op.create_index(op.f("ix_family_members_user_id"), "family_members", ["user_id"], unique=False)

    inspector = sa.inspect(bind)
    if not _column_exists(inspector, "diagnoses", "family_member_id"):
        with op.batch_alter_table("diagnoses", schema=None) as batch_op:
            batch_op.add_column(sa.Column("family_member_id", sa.Integer(), nullable=True))

    inspector = sa.inspect(bind)
    if not _family_member_fk_exists(inspector):
        with op.batch_alter_table("diagnoses", schema=None) as batch_op:
            batch_op.create_foreign_key(
                FAMILY_MEMBER_FK_NAME,
                "family_members",
                ["family_member_id"],
                ["id"],
                ondelete="SET NULL",
            )

    inspector = sa.inspect(bind)
    if not _index_exists(inspector, "diagnoses", DIAGNOSIS_FAMILY_MEMBER_INDEX):
        op.create_index(DIAGNOSIS_FAMILY_MEMBER_INDEX, "diagnoses", ["family_member_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _table_exists(inspector, "diagnoses") and _column_exists(inspector, "diagnoses", "family_member_id"):
        if _index_exists(inspector, "diagnoses", DIAGNOSIS_FAMILY_MEMBER_INDEX):
            op.drop_index(DIAGNOSIS_FAMILY_MEMBER_INDEX, table_name="diagnoses")

        with op.batch_alter_table("diagnoses", schema=None) as batch_op:
            batch_op.drop_column("family_member_id")

    inspector = sa.inspect(bind)
    if _table_exists(inspector, "family_members"):
        if _index_exists(inspector, "family_members", op.f("ix_family_members_user_id")):
            op.drop_index(op.f("ix_family_members_user_id"), table_name="family_members")
        if _index_exists(inspector, "family_members", op.f("ix_family_members_id")):
            op.drop_index(op.f("ix_family_members_id"), table_name="family_members")
        op.drop_table("family_members")
