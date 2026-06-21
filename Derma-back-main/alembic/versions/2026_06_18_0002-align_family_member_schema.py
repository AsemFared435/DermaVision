"""Align family member schema

Revision ID: 2c8f5a4d9e11
Revises: 7f3d2c9b1a80
Create Date: 2026-06-18 00:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2c8f5a4d9e11"
down_revision: Union[str, None] = "7f3d2c9b1a80"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(table_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return table_name in inspector.get_table_names()


def _column_exists(table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def _index_exists(table_name: str, index_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return index_name in {index["name"] for index in inspector.get_indexes(table_name)}


def upgrade() -> None:
    if not _table_exists("family_members"):
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

    if not _index_exists("family_members", "ix_family_members_id"):
        op.create_index(op.f("ix_family_members_id"), "family_members", ["id"], unique=False)
    if not _index_exists("family_members", "ix_family_members_user_id"):
        op.create_index(op.f("ix_family_members_user_id"), "family_members", ["user_id"], unique=False)

    if _table_exists("diagnoses") and not _column_exists("diagnoses", "family_member_id"):
        op.add_column("diagnoses", sa.Column("family_member_id", sa.Integer(), nullable=True))


def downgrade() -> None:
    if _table_exists("diagnoses") and _column_exists("diagnoses", "family_member_id"):
        with op.batch_alter_table("diagnoses") as batch_op:
            batch_op.drop_column("family_member_id")

    if _table_exists("family_members"):
        if _index_exists("family_members", "ix_family_members_user_id"):
            op.drop_index(op.f("ix_family_members_user_id"), table_name="family_members")
        if _index_exists("family_members", "ix_family_members_id"):
            op.drop_index(op.f("ix_family_members_id"), table_name="family_members")
        op.drop_table("family_members")
